module.exports = class Command {
  constructor (name, description, parameters, rank, execute) {
    this.name = name
    this.description = description
    this.parameters = parameters
    this.rank = rank
    this.execute = execute
  }
}
