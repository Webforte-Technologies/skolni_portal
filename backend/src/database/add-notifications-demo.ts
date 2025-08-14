import pool from './connection';

async function addNotificationsDemo() {
  try {
    console.log('🔔 Adding demo notifications...');

    // Pick a school admin and a teacher for demo
    const users = await pool.query(`
      SELECT id, role, school_id FROM users ORDER BY created_at ASC LIMIT 10
    `);
    if (users.rows.length === 0) {
      console.log('No users found. Run init first.');
      return;
    }

    const schoolAdmin = users.rows.find((u: any) => u.role === 'school_admin');
    const teacher = users.rows.find((u: any) => u.role === 'teacher_school');

    const schoolId = schoolAdmin?.school_id || teacher?.school_id || null;

    const items = [
      { user_id: schoolAdmin?.id || null, school_id: schoolId, severity: 'warning', type: 'system.health', title: 'Zvýšená chybovost API', message: 'V posledních 10 minutách stoupla chybovost nad 2%.' },
      { user_id: null, school_id: schoolId, severity: 'info', type: 'school.registration', title: 'Nový učitel čeká na schválení', message: 'Uživatel jan.novak@skola.cz se zaregistroval a čeká na potvrzení.' },
      { user_id: teacher?.id || null, school_id: schoolId, severity: 'error', type: 'billing.payment_failed', title: 'Platba selhala', message: 'Platba za předplatné se nepodařila. Zkontrolujte prosím platební metodu.' }
    ];

    for (const n of items) {
      await pool.query(
        `INSERT INTO notifications (user_id, school_id, severity, type, title, message)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [n.user_id, n.school_id, n.severity, n.type, n.title, n.message]
      );
    }

    console.log(`✅ Inserted ${items.length} demo notifications`);
  } catch (e) {
    console.error('❌ Failed to add demo notifications:', e);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addNotificationsDemo();
}

export default addNotificationsDemo;


