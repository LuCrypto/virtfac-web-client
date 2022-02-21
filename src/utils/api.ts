import Vue from 'vue'
import { Session } from './session'

export default class API {
  static fetch (
    component: Vue,
    method: string,
    path: string,
    body: string | null,
    params: URLSearchParams | null
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const token = Session.getToken()
      const url =
        `http://127.0.0.1:1337${path}` + (params != null ? `?${params}` : '')
      const contentType: string =
        method === 'GET'
          ? 'application/x-www-form-urlencoded'
          : 'application/json'
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
      // console.log(`%c Fetch ${url}`, 'color: #bada55', request)
      console.log(`%c Fetch ${url}`, 'color: #bada55')
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

  static post (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'POST', path, body, null)
  }

  static get (
    component: Vue,
    path: string,
    params: URLSearchParams | null
  ): Promise<Response> {
    return API.fetch(component, 'GET', path, null, params)
  }

  static update (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'UPDATE', path, body, null)
  }

  static delete (component: Vue, path: string, body: string): Promise<Response> {
    return API.fetch(component, 'DELETE', path, body, null)
  }
}
