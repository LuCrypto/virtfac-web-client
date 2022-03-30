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
  static getTheme (): string | null {
    return window.localStorage.getItem('virtfac-theme')
  }

  static setTheme (theme: string): void {
    window.localStorage.setItem('virtfac-theme', theme)
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
