
import { Dexie, Table } from 'dexie';
import { Question, Attempt, Bookmark, ActiveSession } from './types';

// Fix: Property 'version' does not exist on type 'RadPrepDB' error by 
// using the canonical constructor-based configuration pattern for Dexie with TypeScript.
export class RadPrepDB extends Dexie {
  questions!: Table<Question>;
  attempts!: Table<Attempt>;
  bookmarks!: Table<Bookmark>;
  activeSessions!: Table<ActiveSession>;

  constructor() {
    super('RadPrepDB');
    
    // Define stores within the constructor to ensure 'this.version' is correctly 
    // recognized as a member of the base Dexie class.
    this.version(1).stores({
      questions: '++id, chapter, text',
      attempts: '++id, timestamp, mode, score',
      bookmarks: 'questionId, timestamp',
      activeSessions: 'id'
    });
  }
}

export const db = new RadPrepDB();

// Seed initial data if empty
export async function seedInitialData() {
  const count = await db.questions.count();
  if (count === 0) {
    await db.questions.bulkAdd([
      {
        chapter: "Radiation Physics",
        text: "The unit of absorbed dose is:",
        options: ["Gray", "Sievert", "Coulomb/kg", "Roentgen"],
        correctIndex: 0,
        explanation: "Absorbed dose is measured in Gray (Gy), defined as joule per kilogram."
      },
      {
        chapter: "Radiation Physics",
        text: "One Gray is equal to:",
        options: ["1 J/kg", "100 rad", "1 Sv", "0.01 J/kg"],
        correctIndex: 0,
        explanation: "1 Gray is defined as absorption of 1 joule of energy per kilogram of matter."
      },
      {
        chapter: "Radiation Physics",
        text: "The SI unit of radioactivity is:",
        options: ["Curie", "Becquerel", "Gray", "Sievert"],
        correctIndex: 1,
        explanation: "Becquerel (Bq) represents one nuclear disintegration per second."
      }
    ]);
  }
}
