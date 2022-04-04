import dotenv from 'dotenv'
import Vue from 'vue'
import { Session } from './session'

dotenv.config({ path: './.env' })

export default class API {
  static fetch (
    component: Vue,
    method: string,
    path: string,
    body: string | null,
    params: URLSearchParams | null
  ): Promise<Response> {
    const apiIP = process.env.VUE_APP_API_SERVER_IP
    const apiPort = process.env.VUE_APP_API_SERVER_PORT
    return new Promise((resolve, reject) => {
      const token = Session.getToken()
      const url =
        `http://${apiIP}:${apiPort}${path}` +
        (params != null ? `?${params}` : '')
      const contentType: string =
        params != null
          ? 'application/x-www-form-urlencoded'
          : 'application/json;charset=utf-8'
      const request: RequestInit = {
        mode: 'cors' as RequestMode,
        headers: {
          'Content-Type': contentType,
          Authorization: token != null ? `Bearer ${token}` : ''
        },
        method: method
      }
      if (body != null) {
        request.body = body
      }
      console.log(`%c${method} ${url}`, 'color: #bada55')
      fetch(url, request)
        .then(response => {
          if (!response.ok) {
            console.error(response.statusText)
            component.$root.$emit(
              'bottom-message',
              'Sorry, your request could not be executed'
            )
            reject(response.statusText)
            return
          }
          response
            .json()
            .then(json => {
              resolve(json)
            })
            .catch(error => {
              console.error(error)
              component.$root.$emit(
                'bottom-message',
                'Sorry, your request could not be executed'
              )
            })
        })
        .catch(error => {
          console.error(url, request, error)
          component.$root.$emit(
            'bottom-message',
            'Unable to connect to VIRTFac server.'
          )
          reject(error)
        })
    })
  }

  // static fetch (
  //   component: Vue,
  //   method: string,
  //   path: string,
  //   body: string | null,
  //   params: URLSearchParams | null
  // ): Promise<Response> {
  //   // Format parameters
  //   const apiIP = process.env.VUE_APP_API_SERVER_IP
  //   const apiPort = process.env.VUE_APP_API_SERVER_PORT
  //   const token = Session.getToken()
  //   const url =
  //     `http://${apiIP}:${apiPort}${path}` + (params != null ? `?${params}` : '')
  //   // const contentType: string =
  //   //   body == null
  //   //     ? 'application/x-www-form-urlencoded'
  //   //     : 'application/json;charset=utf-8'
  //   // const request: RequestInit = {
  //   //   mode: 'cors' as RequestMode,
  //   //   headers: {
  //   //     'Content-Type': contentType,
  //   //     Authorization: token != null ? `Bearer ${token}` : ''
  //   //   },
  //   //   method: method
  //   // }
  //   // if (body != null) {
  //   //   request.body = body
  //   // }
  //   console.log(`%c${method} ${url}`, 'color: #bada55')

  //   // Process request
  //   return new Promise((resolve, reject) => {
  //     const xhttp = new XMLHttpRequest()

  //     try {
  //       xhttp.open(method, url, true)
  //       xhttp.setRequestHeader(
  //         'Authorization',
  //         token == null ? '' : `Bearer ${token}`
  //       )
  //       xhttp.setRequestHeader(
  //         'Content-type',
  //         body == null
  //           ? 'application/x-www-form-urlencoded'
  //           : 'application/json;charset=utf-8'
  //       )
  //       xhttp.onreadystatechange = () => {
  //         const response = xhttp.responseText
  //         if (xhttp.status === 200 && response) {
  //           try {
  //             const data = JSON.parse(response)
  //             console.log('Good parsed json :', data)
  //             resolve(data)
  //           } catch (e) {
  //             console.error(e)
  //             console.log(
  //               `Invalid parsed json : %c ${response}`,
  //               'color:  #f5a406'
  //             )
  //           }
  //         }
  //       }
  //       xhttp.send(body)
  //     } catch (e) {
  //       API.error(component, `Request error on ${url}`, xhttp.status)
  //       reject(xhttp.status)
  //     }
  //   })
  // }

  static error (component: Vue, message: string, error: any) {
    console.error(error, message)
    component.$root.$emit(
      'bottom-message',
      'Sorry, your request could not be executed'
    )
  }

  static get (
    component: Vue,
    path: string,
    params: URLSearchParams | null
  ): Promise<Response> {
    return API.fetch(component, 'GET', path, null, params)
  }

  static put (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'POST', path, body, null)
  }

  static post (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'POST', path, body, null)
  }

  static patch (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'PATCH', path, body, null)
  }

  static delete (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'DELETE', path, body, null)
  }
}
