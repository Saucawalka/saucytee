import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL); // make sure this matches your server origin
export default socket;