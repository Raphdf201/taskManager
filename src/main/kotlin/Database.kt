package net.raphdf201

import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

@Serializable
data class ExposedUser(
    val id: String,
    val name: String,
    val profileIcon: String?
)

@Serializable
data class ExposedTaskSend(
    val id: Int,
    val title: String,
    val description: String,
    val priority: String,
    val status: String,
    val creatorId: String,
    val dueDate: String
)

@Serializable
data class ExposedTaskReceive(
    val title: String,
    val description: String,
    val priority: String,
    val status: String,
    val creatorId: String,
    val dueDate: String
)

class DatabaseService(database: Database) {
    object Users : Table() {
        val id = varchar("id", 50)
        val name = varchar("name", 50)
        val profileIcon = varchar("profileIcon", 100).nullable()

        override val primaryKey = PrimaryKey(id)
    }

    object Tasks : Table() {
        val id = integer("id").autoIncrement()
        val title = varchar("title", 50)
        val description = varchar("description", 500)
        val priority = varchar("priority", 10)
        val status = varchar("status", 20)
        val creatorId = varchar("creatorId", 50)
        val dueDate = varchar("dueDate", 10)

        override val primaryKey = PrimaryKey(id)
    }

    init {
        /*transaction(database) {
            SchemaUtils.drop(Users, Tasks)
            SchemaUtils.create(Users, Tasks)
        }*/
    }

    suspend fun createUser(user: ExposedUser): String = dbQuery {
        Users.insert {
            it[id] = user.id
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

    suspend fun getUser(id: String?): ExposedUser? {
        if (id == null) return null
        return dbQuery {
            Users.selectAll()
                .where { Users.id eq id }
                .map {
                    ExposedUser(
                        it[Users.id],
                        it[Users.name],
                        it[Users.profileIcon]
                    )
                }
                .singleOrNull()
        }
    }

    suspend fun getUsers(): List<ExposedUser> {
        return dbQuery {
            Users.selectAll()
                .map {
                    ExposedUser(
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

    suspend fun updateUser(id: String?, user: ExposedUser) {
        if (id != null) dbQuery {
            Users.update({ Users.id eq id }) {
                it[name] = user.name
                it[profileIcon] = user.profileIcon
            }
        }
    }

    suspend fun updateTask(id: Int, task: ExposedTaskReceive) {
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

    suspend fun deleteUser(id: String?) {
        if (id != null) dbQuery {
            Users.deleteWhere { Users.id eq id }
        }
    }

    suspend fun deleteTask(id: Int) {
        dbQuery {
            Tasks.deleteWhere { Tasks.id eq id }
        }
    }

    private suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}

