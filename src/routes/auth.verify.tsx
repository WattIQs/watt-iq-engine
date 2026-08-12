import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "../components/auth/VerifyPage";

import {
  verifyOtpChallenge,
} from "../lib/otp-store";

import {
  createSessionCookie,
} from "../lib/session";


function readCookie(
  request: Request,
  name: string,
) {

  const header =
    request.headers.get("cookie");


  if(!header)
    return null;


  const cookie =
    header
      .split(";")
      .map(c=>c.trim())
      .find(
        c=>c.startsWith(`${name}=`)
      );


  if(!cookie)
    return null;


  return cookie.substring(
    name.length + 1,
  );

}



export const Route =
createFileRoute("/auth/verify")({

component:VerifyPage,


server:{

handlers:{


POST:async({request})=>{


try{


const body =
await request.json();


const code =
typeof body.code === "string"
?
body.code.trim()
:
"";


if(code.length !== 6){

return Response.json(
{
message:"Digite o código completo de 6 dígitos.",
},
{
status:400,
},
);

}



const challengeId =
readCookie(
request,
"wattiq_otp",
);



console.log(
"Cookie OTP:",
challengeId,
);



if(!challengeId){

return Response.json(
{
message:
"Sessão de verificação expirada. Solicite um novo código.",
},
{
status:400,
},
);

}



const email =
verifyOtpChallenge(
challengeId,
code,
);



console.log(
"Resultado OTP:",
email,
);



if(!email){

return Response.json(
{
message:
"Código inválido ou expirado.",
},
{
status:400,
},
);

}



const user = {

sub:email,

email,

name:
email.split("@")[0],

};



const headers =
new Headers();


headers.append(
"Set-Cookie",
createSessionCookie(user),
);


headers.append(
"Set-Cookie",
"wattiq_otp=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0",
);



return Response.json(
{
success:true,
},
{
status:200,
headers,
},
);



}catch(error){


console.error(
"Erro verify:",
error,
);


return Response.json(
{
message:
"Não foi possível verificar o código.",
},
{
status:500,
},
);


}


},


},


},


});
