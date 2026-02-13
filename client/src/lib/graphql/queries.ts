import { PACKAGE_ID } from "@/config/constants";

// Query for CreatorRegistered events
export const CREATOR_REGISTERED_EVENTS_QUERY = `
  query GetCreatorRegisteredEvents($after: String) {
    events(
      filter: {
        type: "${PACKAGE_ID}::creator::CreatorRegistered"
      }
      first: 50
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        timestamp
        contents {
          json
        }
      }
    }
  }
`;

// Query for CreatorProfile object by ID
export const CREATOR_PROFILE_QUERY = `
  query GetCreatorProfile($id: SuiAddress!) {
    object(address: $id) {
      address
      version
      asMoveObject {
        contents {
          json
        }
      }
    }
  }
`;

// Query for posts (dynamic fields on CreatorProfile)
export const CREATOR_POSTS_QUERY = `
  query GetCreatorPosts($profileId: SuiAddress!, $after: String) {
    object(address: $profileId) {
      dynamicFields(first: 50, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name {
            json
          }
          value {
            ... on MoveValue {
              json
            }
          }
        }
      }
    }
  }
`;

// Query for user's Subscription objects
export const USER_SUBSCRIPTIONS_QUERY = `
  query GetUserSubscriptions($owner: SuiAddress!, $after: String) {
    objects(
      filter: {
        owner: $owner
        type: "${PACKAGE_ID}::subscription::Subscription"
      }
      first: 50
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        address
        asMoveObject {
          contents {
            json
          }
        }
      }
    }
  }
`;

// Query for PostPublished events by profile
export const POST_PUBLISHED_EVENTS_QUERY = `
  query GetPostPublishedEvents($after: String) {
    events(
      filter: {
        type: "${PACKAGE_ID}::creator::PostPublished"
      }
      first: 50
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        timestamp
        contents {
          json
        }
      }
    }
  }
`;
