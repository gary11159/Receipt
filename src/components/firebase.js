import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import config from '../config/config';

const app = initializeApp(config);
export const db = getDatabase(app);

