import { createFileRoute } from "@tanstack/react-router";
import { exchangeGoogleCode } from "../lib/google-auth";
import {
  generateOtp,
  sendOtpEmail,
} from "../lib/email.otp";
import {
  createOtpChallenge,
} from "../lib/otp-store";


export const Route = createFileRoute(
  "/auth/callback",
)({

server: {

handlers: {

GET: async ({ request }) => {

const url = new URL(request.url);


const code =
url.searchParams.get("code");


const error =
url.searchParams.get("error");



if(error){

return new Response(
`Google recusou o login: ${error}`,
{
status:400,
},
);

}



if(!code){

return new Response(
"Código não recebido",
{
status:400,
},
);

}



try{


const tokens =
await exchangeGoogleCode(code);



if(!tokens.access_token){

throw new Error(
"Sem access token",
);

}



const userResponse =
await fetch(
"https://www.googleapis.com/oauth2/v2/userinfo",
{
headers:{
Authorization:
`Bearer ${tokens.access_token}`,
},
},
);



const googleUser =
await userResponse.json();



if(!googleUser.email){

throw new Error(
"Sem email Google",
);

}



const otp =
generateOtp();



const challengeId =
createOtpChallenge(
googleUser.email,
otp,
);



await sendOtpEmail(
googleUser.email,
otp,
);



const userData =
Buffer.from(
JSON.stringify({

sub:
googleUser.id,

email:
googleUser.email,

name:
googleUser.name ??
googleUser.email.split("@")[0],

picture:
googleUser.picture ?? "",

}),
).toString("base64url");



return new Response(null,{

status:302,

headers:[

[
"Set-Cookie",
`wattiq_otp=${challengeId}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`
],

[
"Set-Cookie",
`wattiq_pending_user=${userData}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`
],

[
"Location",
"/auth/verify"
]

],

});



}catch(error){


console.error(
"Erro Google:",
error,
);


return new Response(
"Erro ao iniciar login",
{
status:500,
},
);


}


},


},


},


});
