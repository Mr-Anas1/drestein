#!/usr/bin/env node

/**
 * Migration Script: Convert single department field to departments array
 * 
 * This script migrates existing special events from:
 *   department: "CSE"
 * to:
 *   departments: ["CSE"]
 * 
 * Run with: node scripts/migrate-departments.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../firebase-service-account.json');
let serviceAccount;

try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('Error: firebase-service-account.json not found');
  console.error('Please ensure the service account file exists at:', serviceAccountPath);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrateEvents() {
  try {
    console.log('Starting migration of special events...\n');

    const snapshot = await db.collection('specialEvents').get();
    const totalDocs = snapshot.size;

    if (totalDocs === 0) {
      console.log('No events found to migrate.');
      process.exit(0);
    }

    console.log(`Found ${totalDocs} events to process.\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const doc of snapshot.docs) {
      try {
        const data = doc.data();
        const eventId = doc.id;

        // Check if already migrated (has departments array)
        if (Array.isArray(data.departments)) {
          console.log(`✓ [${eventId}] Already migrated: ${data.title}`);
          skippedCount++;
          continue;
        }

        // Check if has old department field
        if (data.department) {
          const deptArray = [data.department];
          
          await db.collection('specialEvents').doc(eventId).update({
            departments: deptArray,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`✓ [${eventId}] Migrated: ${data.title} (${data.department})`);
          migratedCount++;
        } else {
          console.log(`⚠ [${eventId}] Skipped: ${data.title} (no department field)`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`✗ Error migrating event ${doc.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Summary:');
    console.log(`  Total Events: ${totalDocs}`);
    console.log(`  Migrated: ${migratedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount === 0) {
      console.log('\n✓ Migration completed successfully!');
    } else {
      console.log(`\n⚠ Migration completed with ${errorCount} error(s).`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  }
}

migrateEvents();
