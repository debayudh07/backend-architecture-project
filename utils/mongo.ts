export const getMongoUri = () =>
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/app';

export const getMongoConnectedMessage = () => 'MongoDB connected successfully';
