package net.raphdf201

import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class ExposedUserSend(
    val id: Int,
    val name: String,
    val profileIcon: String
)

@Serializable
data class ExposedUserReceive(
    val name: String,
    val profileIcon: String
)

@Serializable
data class ExposedTaskSend(
    val id: Int,
    val title: String,
    val description: String,
    val priority: String,
    val status: String,
    val creatorId: Int,
    val dueDate: String
)

@Serializable
data class ExposedTaskReceive(
    val title: String,
    val description: String,
    val priority: String,
    val status: String,
    val creatorId: Int,
    val dueDate: String
)

class DatabaseService(database: Database) {
    object Users : Table() {
        val id = integer("id").autoIncrement()
        val name = varchar("name", 50)
        val profileIcon = varchar("profileIcon", 100)

        override val primaryKey = PrimaryKey(id)
    }

    object Tasks : Table() {
        val id = integer("id").autoIncrement()
        val title = varchar("title", 50)
        val description = varchar("description", 500)
        val priority = varchar("priority", 10)
        val status = varchar("status", 20)
        val creatorId = integer("creatorId")
        val dueDate = varchar("dueDate", 10)

        override val primaryKey = PrimaryKey(id)
    }

    init {
        transaction(database) {
            SchemaUtils.create(Users)
        }
    }

    suspend fun createUser(user: ExposedUserReceive): Int = dbQuery {
        Users.insert {
            it[name] = user.name
            it[profileIcon] = user.profileIcon
        }[Users.id]
    }

    suspend fun createTask(task: ExposedTaskReceive): Int = dbQuery {
        Tasks.insert {
            it[title] = task.title
            it[description] = task.description
            it[priority] = task.priority
            it[status] = task.status
            it[creatorId] = task.creatorId
            it[dueDate] = task.dueDate
        }[Tasks.id]
    }

    suspend fun getUser(id: Int): ExposedUserSend? {
        return dbQuery {
            Users.selectAll()
                .where { Users.id eq id }
                .map { ExposedUserSend(
                    it[Users.id],
                    it[Users.name],
                    it[Users.profileIcon]
                ) }
                .singleOrNull()
        }
    }

    suspend fun getTask(id: Int): ExposedTaskSend? {
        return dbQuery {
            Tasks.selectAll()
                .where { Tasks.id eq id }
                .map {
                    ExposedTaskSend(
                        it[Tasks.id],
                        it[Tasks.title],
                        it[Tasks.description],
                        it[Tasks.priority],
                        it[Tasks.status],
                        it[Tasks.creatorId],
                        it[Tasks.dueDate]
                    )
                }
                .singleOrNull()
        }
    }

    suspend fun getUsers(): List<ExposedUserSend> {
        return dbQuery {
            Tasks.selectAll()
                .map {
                    ExposedUserSend(
                        it[Users.id],
                        it[Users.name],
                        it[Users.profileIcon],
                    )
                }
        }
    }

    suspend fun getTasks(): List<ExposedTaskSend> {
        return dbQuery {
            Tasks.selectAll()
                .map {
                    ExposedTaskSend(
                        it[Tasks.id],
                        it[Tasks.title],
                        it[Tasks.description],
                        it[Tasks.priority],
                        it[Tasks.status],
                        it[Tasks.creatorId],
                        it[Tasks.dueDate]
                    )
                }
        }
    }

    suspend fun updateUser(id: Int, user: ExposedUserSend) {
        dbQuery {
            Users.update({ Users.id eq id }) {
                it[name] = user.name
                it[profileIcon] = user.profileIcon
            }
        }
    }

    suspend fun updateTask(id: Int, task: ExposedTaskSend) {
        dbQuery {
            Tasks.update({ Tasks.id eq id }) {
                it[title] = task.title
                it[description] = task.description
                it[priority] = task.priority
                it[status] = task.status
                it[creatorId] = task.creatorId
                it[dueDate] = task.dueDate
            }
        }
    }

    suspend fun deleteUser(id: Int) {
        dbQuery {
            Users.deleteWhere { Users.id.eq(id) }
        }
    }

    suspend fun deleteTask(id: Int) {
        dbQuery {
            Tasks.deleteWhere { Tasks.id.eq(id) }
        }
    }

    private suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}

