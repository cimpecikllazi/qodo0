import axios from 'axios';
import { User, Location, Review } from './db.js';
import { OpenAI } from 'openai';
import cron from 'node-cron';
import { OPENAI_KEY } from './config.js';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: OPENAI_KEY
});

// Google My Business API base URL
const GOOGLE_API_BASE = 'https://mybusiness.googleapis.com/v4';

// Function to refresh Google access token
async function refreshAccessToken(user) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: user.refreshToken,
      grant_type: 'refresh_token'
    });

    user.accessToken = response.data.access_token;
    await user.save();
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
}

// Function to fetch locations from Google My Business
async function fetchGoogleLocations(accessToken) {
  try {
    const response = await axios.get(`${GOOGLE_API_BASE}/accounts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const accounts = response.data.accounts;
    const locations = [];

    for (const account of accounts) {
      try {
        const locationsResponse = await axios.get(
          `${GOOGLE_API_BASE}/${account.name}/locations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );

        if (locationsResponse.data.locations) {
          locations.push(...locationsResponse.data.locations);
        }
      } catch (error) {
        console.error(`Error fetching locations for account ${account.name}:`, error);
      }
    }

    return locations;
  } catch (error) {
    console.error('Error fetching Google accounts/locations:', error);
    throw error;
  }
}

// Function to fetch reviews from Google My Business
async function fetchGoogleReviews(accessToken, locationId) {
  try {
    const response = await axios.get(
      `${GOOGLE_API_BASE}/${locationId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return response.data.reviews || [];
  } catch (error) {
    console.error(`Error fetching reviews for location ${locationId}:`, error);
    throw error;
  }
}

// Function to generate AI reply using OpenAI
async function generateAIReply(review, location) {
  try {
    const prompt = `
      Generate a 2-sentence response to the following Google review:
      
      Review: "${review.comment}"
      Rating: ${review.rating} stars
      Location: ${location.name}
      
      Guidelines:
      1. Mention the reviewer's name (${review.reviewer.displayName}) and the city if available
      2. If the rating is less than 4 stars, include an apology
      3. Keep it professional and friendly
      4. Do not make up facts about the business
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates professional responses to Google reviews.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI reply:', error);
    return null;
  }
}

// Function to publish reply to Google My Business
async function publishReplyToGoogle(accessToken, reviewId, replyText) {
  try {
    await axios.put(
      `${GOOGLE_API_BASE}/${reviewId}/reply`,
      { replyText },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Error publishing reply for review ${reviewId}:`, error);
    return false;
  }
}

// Main function to sync reviews
async function syncReviews() {
  console.log('Starting review sync...');
  
  try {
    // Get all users with active subscriptions
    const users = await User.findAll({
      where: {
        subscriptionStatus: 'active',
        accessToken: {
          [Sequelize.Op.not]: null
        }
      }
    });

    for (const user of users) {
      try {
        console.log(`Syncing reviews for user ${user.id}...`);
        
        // Refresh access token if needed
        let accessToken = user.accessToken;
        // In a real implementation, you'd check if the token is expired
        
        // Fetch locations from Google
        const googleLocations = await fetchGoogleLocations(accessToken);
        
        // Sync locations with our database
        for (const googleLocation of googleLocations) {
          const [location, created] = await Location.findOrCreate({
            where: {
              googleLocationId: googleLocation.name,
              userId: user.id
            },
            defaults: {
              userId: user.id,
              googleLocationId: googleLocation.name,
              name: googleLocation.locationName || 'Unknown Location',
              address: googleLocation.address ? 
                `${googleLocation.address.addressLines?.join(', ') || ''}` : 
                null
            }
          });
          
          if (!created) {
            // Update existing location
            location.name = googleLocation.locationName || location.name;
            await location.save();
          }
          
          // Fetch reviews for this location
          const googleReviews = await fetchGoogleReviews(accessToken, googleLocation.name);
          
          // Process each review
          for (const googleReview of googleReviews) {
            // Check if we already have this review
            const [review, reviewCreated] = await Review.findOrCreate({
              where: {
                googleReviewId: googleReview.name
              },
              defaults: {
                locationId: location.id,
                googleReviewId: googleReview.name,
                reviewerName: googleReview.reviewer.displayName,
                rating: googleReview.starRating,
                comment: googleReview.comment,
                replyStatus: 'pending'
              }
            });
            
            // If this is a new review, generate an AI reply
            if (reviewCreated && googleReview.comment) {
              console.log(`Generating AI reply for review ${googleReview.name}...`);
              const aiReply = await generateAIReply(googleReview, location);
              
              if (aiReply) {
                review.reply = aiReply;
                await review.save();
                console.log(`AI reply generated for review ${googleReview.name}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing reviews for user ${user.id}:`, error);
      }
    }
    
    console.log('Review sync completed.');
  } catch (error) {
    console.error('Error during review sync:', error);
  }
}

// Schedule the review sync to run every 10 minutes
cron.schedule('*/10 * * * *', () => {
  syncReviews();
});

// Export functions for manual triggering
export {
  syncReviews,
  publishReplyToGoogle,
  refreshAccessToken
};