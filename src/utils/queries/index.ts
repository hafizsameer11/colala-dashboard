// Export all query functions from here
export * from './banners';
export * from './categories';
export * from './dashboard';
export * from './notifications';
export * from './referrals';
export * from './support';
export * from './withdrawalRequests';

// Export chats functions with explicit naming to avoid conflicts
export {
  getChats,
  getChatsStats,
  getChatDetails as getChatDetailsById
} from './chats';

// Export users functions with explicit naming to avoid conflicts
export {
  getAllUsers,
  getUserStats,
  searchUsers,
  getUserProfile,
  getUserDetails as getUserDetailsById,
  getChatDetails as getUserChatDetails
} from './users';
