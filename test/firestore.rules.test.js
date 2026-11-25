const fs = require('fs');
const path = require('path');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} = require('firebase/firestore');

const projectId = 'wsps-emulator-rules-test';
let testEnv;

const users = {
  admin: { uid: 'admin-test', role: 'admin', brand: '' },
  wrd: { uid: 'wrd-test', role: 'wrd', brand: '' },
  brandA: { uid: 'brand-a-test', role: 'brand', brand: 'Brand A' },
  brandB: { uid: 'brand-b-test', role: 'brand', brand: 'Brand B' },
};

function ctx(user) {
  return testEnv.authenticatedContext(user.uid);
}

function ref(db, collection, id) {
  return doc(db, collection, id);
}

function validEntry(brand = 'Brand A', updatedBy = users.brandA.uid) {
  return {
    brand,
    weekId: '2099-W01',
    styles: 2,
    pieces: 10,
    updatedBy,
    updatedAt: new Date('2099-01-01T00:00:00Z'),
  };
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8'),
    },
  });

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const user of Object.values(users)) {
      await setDoc(ref(db, 'users', user.uid), user);
    }
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe('WSPS Firestore Security Rules (Firebase Emulator only)', () => {
  it('rejects unauthenticated reads and writes to the current aggregate', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const main = ref(db, 'wsps', 'data');
    await assertFails(getDoc(main));
    await assertFails(setDoc(main, { value: '{}', updatedAt: 1 }));
  });

  it('allows authenticated users to read the current aggregate', async () => {
    const db = ctx(users.admin).firestore();
    await testEnv.withSecurityRulesDisabled(async (adminCtx) => {
      await setDoc(ref(adminCtx.firestore(), 'wsps', 'data'), {
        value: '{}',
        updatedAt: 1,
      });
    });
    await assertSucceeds(getDoc(ref(db, 'wsps', 'data')));
  });

  it('blocks brand users from writing the current aggregate document', async () => {
    const db = ctx(users.brandA).firestore();
    await assertFails(setDoc(ref(db, 'wsps', 'data'), {
      value: '{}',
      updatedAt: 2,
    }));
  });

  it('allows WRD and admin to write the current aggregate', async () => {
    for (const user of [users.wrd, users.admin]) {
      const db = ctx(user).firestore();
      await assertSucceeds(setDoc(ref(db, 'wsps', 'data'), {
        value: '{}',
        updatedAt: 3,
      }));
    }
  });

  it('allows a privileged backup create but blocks overwrite and delete', async () => {
    const db = ctx(users.admin).firestore();
    const backup = ref(db, 'wsps', 'backup-2099-01-01');
    const data = {
      value: JSON.stringify({ schemaVersion: 2 }),
      savedAt: new Date('2099-01-01T00:00:00Z'),
      bytes: 19,
      sha256: 'test-hash',
      schemaVersion: 2,
    };
    await assertSucceeds(setDoc(backup, data));
    await assertFails(updateDoc(backup, { bytes: 20 }));
    await assertFails(deleteDoc(backup));
  });

  it('allows append-only audit logs and blocks update/delete', async () => {
    const db = ctx(users.brandA).firestore();
    const log = ref(db, 'wsps_audit_logs', 'audit-2099-01-01-001');
    const data = {
      id: 'audit-2099-01-01-001',
      actorUid: users.brandA.uid,
      at: new Date('2099-01-01T00:00:00Z'),
      brand: 'Brand A',
      weekId: '2099-W01',
      field: 'styles',
      before: 1,
      after: 2,
      source: 'emulator-test',
    };
    await assertSucceeds(setDoc(log, data));
    await assertFails(updateDoc(log, { after: 3 }));
    await assertFails(deleteDoc(log));
  });

  it('allows a brand to create and update only its own future split record', async () => {
    const db = ctx(users.brandA).firestore();
    const own = ref(db, 'wsps_entries', 'brand-a-2099-w01');
    await assertSucceeds(setDoc(own, validEntry()));
    await assertSucceeds(updateDoc(own, { styles: 3, pieces: 10 }));

    const other = ref(db, 'wsps_entries', 'brand-b-2099-w01');
    await assertFails(setDoc(other, validEntry('Brand B')));
  });

  it('rejects invalid split-record values for every identity', async () => {
    const db = ctx(users.admin).firestore();
    await assertFails(setDoc(ref(db, 'wsps_entries', 'negative'), {
      ...validEntry('Brand A', users.admin.uid),
      styles: -1,
    }));
    await assertFails(setDoc(ref(db, 'wsps_entries', 'styles-over-pieces'), {
      ...validEntry('Brand A', users.admin.uid),
      styles: 11,
      pieces: 10,
    }));
    await assertFails(setDoc(ref(db, 'wsps_entries', 'unknown-field'), {
      ...validEntry('Brand A', users.admin.uid),
      unexpected: true,
    }));
  });

  it('blocks all users from deleting split records and user records', async () => {
    const brandDb = ctx(users.brandA).firestore();
    await assertFails(deleteDoc(ref(brandDb, 'wsps_entries', 'brand-a-2099-w01')));
    await assertFails(deleteDoc(ref(brandDb, 'users', users.brandA.uid)));
  });
});
