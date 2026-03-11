import * as jose from 'jose';
import { db } from '../firebase';
import { ref, get, set } from 'firebase/database';

// Service Account Details from User
const SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "vita-f39ba",
    "private_key_id": "3edcbe4ee711aa05c4f89140ab77f5a4bd2b02e2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCzHdGIexy4Egsr\n+kLGqXSbF7gi02FMpg4LwoARwqEHNskuYeoVskEQIgq4lhCDdA682ivlOH1kgq+k\n9kqRsMJPo4tfkyZhPG2PH+5I/rDgHKMjmOpz5DwnkPszcu59M7FsE/YoYWGOWTKk\n2U+DhNUQ3oL+Be7eNm3yhSk5kDWWoCVY9HMxFJ/xoX08asEMLvqIxEG/nynfNKRH\ngBArD8x8jHMX0UwuIKWUkPVjbA4D7IdKtzCdF3aaAUTHhl0Sn0YU1BdhKfA7JbG7\nkA/4Z8UF4wFoWgg6WI+MzPcSejOzXwA6C02aDki0tQjcpDOjWcRv6MnilOgXKgJf\nR3VADfKtAgMBAAECggEAFcY3Na85s4rF/ueifIIXIc+FW/50YpwBMx7G8OHHL5hS\nZqgSi+aqkCqDQSNFCKXwMLcZBPmUDMbyUUx7jjB9vq6z/79kuAdfjjmkfw0vNV9l\n2ar6PXJueaTfVMbRBTlmhSv8Dbag5GwlgvLD/soEGNPj+rt/6VWWkhfsBgpo6VGE\nfu0xwKd/Cr5Q1XIwYyvd9l6dJxAITrgZGhcvhYdrlfzqgsGQ582W0HKrcCEMSaC/\nvQxSkCb5Ed7ui0fnGBumZz8Fx40VCfKZUJ36ewaJdRW2QNcRr08s3XHsjGXUdNuc\n3WPa0JvL57HcWFxcDA38crLx3huG+p8F9MKF8MjKJQKBgQDebOkSO09L5uo4fVde\nQbZqVfYpy7HeiJ/5D0s9x9bKmp93r82sIEhLA1/mRMUgzNnvEqwUx+Z2dkTJFyU2\nIJyq5yMYQcf2cyd4PJliH0vHsDDV8zaffVQJ3ETu1/7+V6weOhyKDikP+5Z2m93e\nxsWTvxncXY+Iw8thebB/kU3X/wKBgQDOJ1bFotxgiKHA2ZWXoyon0wgTdvUfa8Zy\nqQO0IL4IS8ESrkkbTXvbQb6TD/vnYJ5sdf40NMS9JfQPI26KEuwQmBnHrO5YBmf2\n4NR0bVYR2PO1k+D5a0bnCADBG9jIeJVtGfgTYYZp/6hrLDgp+8dMA3DLGp4QPiFE\n2BQgJucVUwKBgQDGNAb9WByxZnQRIqBYPfZvi2pwlDNMOjNTnW1PAGVG5cJ0xRRh\n7eJ99ePfLij7sZACmoD9g6S6q2lgSF/AfA8fvBhp5TRrSPJDEr0b0weUSk06WiCy\nvtvEbaR/sbpoq3eU9/O2kifFNkw+JWbwvfASWJiS5kyhctgpZGcDRlg3wQKBgQCs\n8G9oiIEbMkOPhnhppuU8V1pVCdwEKeNmWMbUmwsP5oznYPHPR6b5fiOjNyt5JKKC\nFlHT9dh9XJNrB6w5hDooiZBG45lmmqkof996dCZZ/ogj8RQv6ICoWxxW40dulUm1\nJq3nhE7AKUpd7dCH18GO0OwUVhX3Rkeeey4W8su0JQKBgQDLRrpPJETlOOk21CM1\nvH7ke3Ko38zaFoMf2KNdWGHbbUKyFUR9mEROE6LOspw9+qm6WpMqVDknK4JdSu4T\nC1OdJTv+mVehH894vnkAPU4TDil0XCG5QWvPwinJrWMSca/9f+XZi2r/O1xWpbl/\n7cjXfP/Bc47MRsAmpNCS/JcGaQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@vita-f39ba.iam.gserviceaccount.com",
};

async function getAccessToken() {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;

    const payload = {
        iss: SERVICE_ACCOUNT.client_email,
        scope: 'https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: exp,
        iat: iat,
    };

    const privateKey = await jose.importPKCS8(SERVICE_ACCOUNT.private_key, 'RS256');

    const jwt = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'RS256' })
        .sign(privateKey);

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to get access token: ${data.error_description || data.error}`);
    }

    return data.access_token;
}

export async function sendFcmNotification(orderData: any) {
    try {
        console.log("Preparing to send FCM notification...");

        // 1. Get Access Token
        const accessToken = await getAccessToken();

        // 2. Get Admin Tokens from Database
        const tokensRef = ref(db, 'adminTokens');
        const snapshot = await get(tokensRef);

        if (!snapshot.exists()) {
            console.warn("No admin tokens found in database. Notification won't be sent.");
            return;
        }

        const tokensMap = snapshot.val();
        const adminTokens = Object.values(tokensMap) as string[];
        console.log(`Found ${adminTokens.length} admin tokens.`);

        // 🚀 Remote Log for Dispatch
        const dispatchLogRef = ref(db, `logs/fcm_dispatch/${new Date().getTime()}`);
        await set(dispatchLogRef, {
            tokenCount: adminTokens.length,
            orderId: orderData.id || 'N/A',
            timestamp: new Date().toISOString()
        });

        // 3. Send Notification to each token
        const orderNum = orderData.orderNumber || '999';
        const customer = orderData.customerName || 'عميل جديد';
        const total = orderData.totalAmount || '0';

        const sendPromises = adminTokens.map(async (token) => {
            const message = {
                message: {
                    token: token,
                    notification: {
                        title: '✨ طلب جديد في Vita!',
                        body: `📦 طلب رقم #${orderNum}\n👤 العميل: ${customer}\n💰 المجموع: ${total} ج.س`,
                    },
                    android: {
                        priority: 'high',
                        notification: {
                            channel_id: 'new_orders_fcm',
                            sound: 'notifications',
                            icon: 'ic_stat_name',
                            click_action: 'OPEN_ORDER_HISTORY',
                        }
                    },
                    data: {
                        orderId: orderData.id || '',
                        type: 'new_order'
                    }
                }
            };

            const resp = await fetch(`https://fcm.googleapis.com/v1/projects/${SERVICE_ACCOUNT.project_id}/messages:send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
            });

            const result = await resp.json();
            if (!resp.ok) {
                console.error(`Failed to send notification to token ${token}:`, result.error);
                if (result.error?.status === 'NOT_FOUND' || result.error?.status === 'UNREGISTERED') {
                    // Cleanup stale tokens if possible
                }
            } else {
                console.log(`Notification sent successfully to ${token}`);
            }
        });

        await Promise.all(sendPromises);
        console.log("FCM notification broadcast complete.");

    } catch (error) {
        console.error("Critical error sending FCM notification:", error);
    }
}
