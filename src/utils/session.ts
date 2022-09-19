export class User {
  id = 0
  access = 0
  firstname = ''
  lastname = ''
  login = ''
  mail = ''
  phone = ''
  picture = ''
  pseudo = ''
  token = ''
  constructor (attributes?: Partial<User>) {
    Object.assign(this, attributes)
  }
}

export class Session {
  static getTheme (): string {
    return window.localStorage.getItem('virtfac-theme') || 'light'
  }

  static setTheme (theme: string): void {
    window.localStorage.setItem('virtfac-theme', theme)
  }

  static getLanguage (): string {
    return window.localStorage.getItem('virtfac-language') || 'french'
  }

  static setLanguage (language: string): void {
    window.localStorage.setItem('virtfac-language', language)
  }

  static getUser (): User | null {
    const data = window.localStorage.getItem('virtfac-user')
    return data == null ? null : new User(JSON.parse(data))
  }

  static getToken (): string | null {
    const user = Session.getUser()
    return user == null ? null : user.token
  }

  static setUser (user: User): void {
    window.localStorage.setItem('virtfac-user', JSON.stringify(user))
  }

  static deleteUser (): void {
    window.localStorage.removeItem('virtfac-user')
  }
}
