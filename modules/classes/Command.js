module.exports = class Command {
  constructor (name, description, parameters, perm, execute) {
    this.name = name
    this.description = description
    this.parameters = parameters
    this.perm = perm
    this.execute = execute
  }
}
