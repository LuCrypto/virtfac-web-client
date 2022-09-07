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
          Authorization: `Bearer ${token}`
        },
        method: method
      }
      if (body != null) {
        request.body = body
      }
      console.log(`%c${method} ${url}`, 'color: #bada55')

      // Try to fetch
      fetch(url, request)
        .then(response => {
          // Handle error in response
          if (!response.ok) {
            if (response.body) {
              // Get JSON error message from API if exist
              response
                .json()
                .then(json => {
                  console.error(`API error response : ${json.message}.`)
                  component.$root.$emit(
                    'bottom-message',
                    'Sorry, your request could not be executed'
                  )
                  reject(response)
                })
                .catch(_ => {
                  console.error(response)
                  component.$root.$emit(
                    'bottom-message',
                    'Sorry, your request could not be executed'
                  )
                })
            } else {
              // Show other API error type
              console.error(response)
              component.$root.$emit(
                'bottom-message',
                'Sorry, your request could not be executed'
              )
              reject(response)
            }
            return
          }

          // Request response is 200 ok !
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

        // Cannot fetch API
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
    return API.fetch(component, 'PUT', path, body, null)
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
