import * as jose from 'jose';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';

// Service Account Details from User
const SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "vita-e5e4f",
    "private_key_id": "3722e387227e64a3eb5a2822b005a333cd9d60a4",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDcXnDDkG41Z8D0\nqQI+Tj5sAthL3pnxmOiRzedGVrmdlLlP2Kcb/+iHsLOBVp50gJVlBVIXPCMzH0ML\n72c5/HS0wLrimNgUG6oCRR8gUrYt5FZWcRBYciJz/rl1hRGTvUz252W0XNYAT+8D\n4+yn63jw/KTexUTkzZS8P+ncgt2hsegGv85hopjvmpA1xybKR1gIOVnNkMNgFLkE\ndmceLbRfgxu8wqR6ez98a2jAmM/6IHAygkYKLc+YBKfFi/mJm1IwPvtQM81gzDsb\nqSdCHcb/Pq6PESsdWFBJm4ouItB8uFiPdFFdyg/wXunarbCcQNSAa2HGRA7tiFkK\nxO8Zb0MdAgMBAAECggEACbtr/6vSii5AvpO/z+oBsyB1b/UiCru5IOAdVvIAJ/FV\nAi2fXhexRVwGGW/hw8n+W9dEnSN6EUk2QbUuQGI7WNSejEcgWwb7vTaGd0ispGs0\noVDd99UwKCJEPrUeDE6SzK0Pq0vJGBUJPIk/PtoIRDayi01Ey4jR73X9Iuo7b02u\n9G6UrdDskM19M7kfKYtTKNwFbNwuaaoxtD2YX8qdS7kUle83r449j1xRNI7GTvaM\nci13u7nbwlmKePpc93HkTYEZ6HmU6VkxuLhrzmg2jjVYx/h3dMSUmU5rAAXTMMRy\nuV8XpQ84r2emF3wCSgB3H5Skj+4cPxqOhKJV0IK32wKBgQD96Zte/+aFV1Msg6iA\n+DqRt2T6deUL10L2/lz/XE7LflRnCBdsUiJKtL6xt+dNQgiCuvaDLQum/9MHj4/u\nJG62SFH2hvwBj/AeLVRjcGQqUtjizYZhR4+EYUOshrUdMWiWpwDV3yqZH68Ury5l\neUZnM3Xnh/A6N+LaMHpfzVtHPwKBgQDeLjyLpoxcCqg9z8rg2JQhAS6sDnph0FJN\n+8t/W1vIu9LJxezSG1EHmht+Do80N3cAW4YbuI9puCRSLcp7cU3sfiqLEEnHeGaX\nsGUU3z9OmxZ75u84gBULCQqmD004cC7NRaYr5yoj9kZkYDscJrS8Nh2GFJcpL8cN\nKQZDcEuaowKBgGhWAARPfzg3o/PcvfcRCXArPhE1NMNi1x+Lckd0dORlquUTjBx0\nu6abEukQOrmicsDVdsp8Thd3dA3dTjV7PwskOJnm6dLyhKbB1bVuz5ocpQa9kYST\n1UN+fEJ+sBmo3eNaCJvZsjVtsZH8UkJcTTPHD6HuWCZ0JIGn/gEz71gdAoGAOxqd\nrKC/kfSb0OWoGKxEq4r++XJYiBC89FXZSqXpArtEVby7RSFTKuyKB7yjx8ZBd+zg\n/hrYu8zqjJn11WTMz+64LopEtjWHRS79lNHWq3iCQK+sT6Fy956OIKLNbggZyy2O\nCPvTsAFhtG4NC24YgkD7FaIAnEpDb3LMYcBLvHUCgYBs19DuC6zrkN/I1JIdeuM8\nsiaJDOpfeHyn114K2SB+8p2DBV7J3IrZshhM0v9b14LJMro6vswHcBTxp9SerxuI\nI/ou7F79+3851aJTEJVhOgR59pqezn+XCBW5IzHlb5oABhuSQpn1pjY1Q290ikol\ncJxJf78RVxI7OWAIXQu2AA==\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@vita-e5e4f.iam.gserviceaccount.com",
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

        const adminTokens = Object.keys(snapshot.val());
        console.log(`Found ${adminTokens.length} admin tokens.`);

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
