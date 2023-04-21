<h2>s1kebeats API</h2>

/api

/register

body: {

email: email string;
username: numbers and letters only string;
password: 8 chars min, at least one digit, at least one upper case letter string

}

/login

body: {

username: string;
password: string;
refresh: boolean; (controls refresh token cookie sending)

}

/edit

auth: true;

body: {

username?: numbers and letters only string;
displayedName?: string;
about?: string;
youtube?: string;
vk?: string;
instagram?: string;
image?: 'image/' containing string;

}

/logout

auth: true;

cookies: {

refreshToken: string; (http-only)

}

/activate/:activationLink

params: {

activationLink: string;

}

/refresh

auth: true;

cookies: {

refreshToken: string; (http-only)

}

/checkusername/:username

params: {

username: numbers and letters only string;

}

/media

/upload

auth: true;

body: {

path: 'image' | 'mp3' | 'wave' | 'stems'

}

files: [

path == 'image': {

extensions: [".png", ".jpg", ".jpeg"]

} |
path == 'mp3': {

extension: ".mp3"
max size: 150mb

} |
path == 'wave': {

extension: ".wav"
max size: 300mb

} |
path == 'stems': {

extensions: [".zip", ".rar"]
max size: 500mb

}

]

/beat

/upload

auth: true;

body: {

name: string;
wavePrice: decimal string;
wave: string containing "wave/";
mp3: string containing "mp3/";
stemsPrice?: string containing "stems/", required if stems provided;
stems: string containing "stems/", required if stemsPrice provided;
image?: string containing "image/";
bpm?: decimal string;
description?: string;

}
