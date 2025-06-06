const axios = require('axios')
const zoomHelpers = require('./zoom-helpers')

const getZoomAccessToken = async (
  zoomAuthorizationCode,
  redirect_uri = process.env.ZOOM_APP_REDIRECT_URI,
  pkceVerifier = undefined
) => {
  const params = {
    grant_type: 'authorization_code',
    code: zoomAuthorizationCode,
    redirect_uri,
  }

  if (typeof pkceVerifier === 'string') {
    params['code_verifier'] = pkceVerifier
  }

  const tokenRequestParamString = zoomHelpers.createRequestParamString(params)

  return await axios({
    url: `${process.env.ZOOM_HOST}/oauth/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: process.env.ZOOM_APP_CLIENT_ID,
      password: process.env.ZOOM_APP_CLIENT_SECRET,
    },
    data: tokenRequestParamString,
  })
/*
  console.log("Authorization code:", zoomAuthorizationCode);
  console.log("Code verifier:", pkceVerifier);
  let buff = Buffer.from(process.env.ZOOM_APP_CLIENT_ID + ":" + process.env.ZOOM_APP_CLIENT_SECRET);
  let base64data = buff.toString('base64');
  const url = process.env.ZOOM_HOST + "/oauth/token";
  const config = {
      headers: {
          'Content-Type': "application/x-www-form-urlencoded",
          'Authorization': "Basic " + base64data
      }
  };
  const data = {
      'code_verifier': pkceVerifier,
      'code': zoomAuthorizationCode,
      'grant_type': 'authorization_code',
      'redirect_uri': process.env.ZOOM_APP_REDIRECT_URI
  }
  try {
    let result = await axios.post (url, data, config);
    console.log(result.data);
    return result;
  } catch (e) {
    console.error(e);
    //throw e;
  }
*/


}

const refreshZoomAccessToken = async (zoomRefreshToken) => {
  const searchParams = new URLSearchParams()
  searchParams.set('grant_type', 'refresh_token')
  searchParams.set('refresh_token', zoomRefreshToken)

  return await axios({
    url: `${process.env.ZOOM_HOST}/oauth/token?${searchParams.toString()}`,
    method: 'POST',
    auth: {
      username: process.env.ZOOM_APP_CLIENT_ID,
      password: process.env.ZOOM_APP_CLIENT_SECRET,
    },
  })
}

const getZoomUser = async (accessToken) => {
  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/users/me`,
//    url: `${process.env.ZOOM_URL}/v2/users/me`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

const getDeeplink = async (accessToken) => {
  return await axios({
    url: `${process.env.ZOOM_HOST}/v2/zoomapp/deeplink`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: {
      action: JSON.stringify({
        url: '/your/url',
        role_name: 'Owner',
        verified: 1,
        role_id: 0,
      }),
    },
  })
}

module.exports = {
  getZoomAccessToken,
  refreshZoomAccessToken,
  getZoomUser,
  getDeeplink,
}
