import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db/store';
import { RoleType } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (action === 'ADMIN_LOGIN') {
      const email = (body.email || '').trim().toLowerCase();
      const passphrase = (body.passphrase || '').trim();
      const role: RoleType = body.role || 'ADMIN';

      const validPassphrase =
        process.env.ADMIN_BOOTSTRAP_TOKEN || 'lastcry-sandbox-admin-2026';

      if (passphrase !== validPassphrase) {
        return NextResponse.json(
          {
            error:
              'Invalid administrator bootstrap token or passphrase. (For local development/demo, use: lastcry-sandbox-admin-2026)',
          },
          { status: 401 }
        );
      }

      db.auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: now,
        actorEmail: email || 'admin@lastcry.in',
        actorRole: role,
        action: 'ADMIN_AUTH',
        entityType: 'Session',
        entityId: email || 'admin@lastcry.in',
        summary: `Administrator session authenticated with role ${role}.`,
      });
      saveDb(db);

      const res = NextResponse.json({
        success: true,
        admin: {
          email: email || 'admin@lastcry.in',
          role,
        },
      });

      res.cookies.set('lastcry_admin_session', 'authenticated_admin', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8,
      });
      return res;
    }

    if (action === 'ADMIN_LOGOUT') {
      const res = NextResponse.json({ success: true });
      res.cookies.delete('lastcry_admin_session');
      return res;
    }

    if (action === 'CUSTOMER_LOGIN_OR_REGISTER') {
      const email = (body.email || '').trim().toLowerCase();
      const fullName = (body.fullName || '').trim();
      const phone = (body.phone || '').trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address.' },
          { status: 400 }
        );
      }

      let user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        user = {
          id: `usr-${Date.now()}`,
          email,
          phone: phone || '+91 98000 00000',
          fullName: fullName || email.split('@')[0],
          passwordHash: 'pbkdf2_verified_session',
          role: 'CUSTOMER',
          permissions: ['VIEW_OWN_ORDERS', 'MANAGE_OWN_PROFILE', 'MANAGE_OWN_ADDRESSES'],
          savedAddresses: [],
          wishlistProductIds: [],
          consentPreferences: {
            orderUpdatesEmail: true,
            orderUpdatesSms: true,
            guidanceNewsletterOptIn: false,
            bereavementPrivacyAck: true,
            updatedAt: now,
          },
          createdAt: now,
        };
        db.users.push(user);
        saveDb(db);
      }

      const { passwordHash: _unused, ...safeUser } = user;
      void _unused;
      return NextResponse.json({ success: true, user: safeUser });
    }

    if (action === 'UPDATE_CONSENT') {
      const user = db.users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }
      user.consentPreferences = {
        orderUpdatesEmail: Boolean(body.orderUpdatesEmail),
        orderUpdatesSms: Boolean(body.orderUpdatesSms),
        guidanceNewsletterOptIn: Boolean(body.guidanceNewsletterOptIn),
        bereavementPrivacyAck: true,
        updatedAt: now,
      };
      saveDb(db);
      const { passwordHash: _unused, ...safeUser } = user;
      void _unused;
      return NextResponse.json({ success: true, user: safeUser });
    }

    if (action === 'ADD_ADDRESS') {
      const user = db.users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }
      const newAddr = {
        id: `addr-${Date.now()}`,
        label: body.label || 'Home',
        recipient: body.recipient || user.fullName,
        phone: body.phone || user.phone,
        line1: body.line1,
        line2: body.line2 || '',
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        isDefault: user.savedAddresses.length === 0,
      };
      user.savedAddresses.push(newAddr);
      saveDb(db);
      const { passwordHash: _unused, ...safeUser } = user;
      void _unused;
      return NextResponse.json({ success: true, user: safeUser });
    }

    if (action === 'REQUEST_ACCOUNT_DELETION') {
      const user = db.users.find((u) => u.email.toLowerCase() === (body.email || '').toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
      }
      user.deletionRequestedAt = now;
      saveDb(db);
      const { passwordHash: _unused, ...safeUser } = user;
      void _unused;
      return NextResponse.json({
        success: true,
        user: safeUser,
        message:
          'Your account deletion and personal data erasure request has been recorded. Statutory tax invoices are retained in archival storage as required under Indian GST regulations.',
      });
    }

    return NextResponse.json({ error: 'Invalid auth action.' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Authentication service error.' }, { status: 500 });
  }
}
