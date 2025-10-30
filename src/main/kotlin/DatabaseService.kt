package net.raphdf201

import kotlinx.coroutines.Dispatchers
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

@Serializable
data class ExposedUser(
    val name: String,
    val role: String
)

@Serializable
data class ExposedTask(
    val title: String,
    val description: String,
    val createdDate: String,
    val dueDate: String,
    val creatorId: Int
)

class DatabaseService(database: Database) {
    object Users : Table() {
        val id = integer("id").autoIncrement()
        val name = varchar("name", 50)
        val role = varchar("role", 10)

        override val primaryKey = PrimaryKey(id)
    }

    object Tasks: Table() {
        val id = integer("id").autoIncrement()
        val title = varchar("title", 50)
        val description = varchar("description", 500)
        val createdDate = varchar("createdDate", 10)
        val dueDate = varchar("dueDate", 10)
        val creatorId = integer("creatorId")

        override val primaryKey = PrimaryKey(id)
    }

    init {
        transaction(database) {
            SchemaUtils.create(Users)
        }
    }

    suspend fun createUser(user: ExposedUser): Int = dbQuery {
        Users.insert {
            it[name] = user.name
            it[role] = user.role
        }[Users.id]
    }

    suspend fun createTask(task: ExposedTask): Int = dbQuery {
        Tasks.insert {
            it[title] = task.title
            it[description] = task.description
            it[createdDate] = task.createdDate
            it[dueDate] = task.dueDate
            it[creatorId] = task.creatorId
        }[Tasks.id]
    }

    suspend fun getUser(id: Int): ExposedUser? {
        return dbQuery {
            Users.selectAll()
                .where { Users.id eq id }
                .map { ExposedUser(it[Users.name], it[Users.role]) }
                .singleOrNull()
        }
    }

    suspend fun getTask(id: Int): ExposedTask? {
        return dbQuery {
            Tasks.selectAll()
                .where { Tasks.id eq id }
                .map { ExposedTask(
                    it[Tasks.title],
                    it[Tasks.description],
                    it[Tasks.createdDate],
                    it[Tasks.dueDate],
                    it[Tasks.creatorId]
                ) }
                .singleOrNull()
        }
    }

    suspend fun updateUser(id: Int, user: ExposedUser) {
        dbQuery {
            Users.update({ Users.id eq id }) {
                it[name] = user.name
                it[role] = user.role
            }
        }
    }

    suspend fun updateTask(id: Int, task: ExposedTask) {
        dbQuery {
            Tasks.update({ Tasks.id eq id }) {
                it[title] = task.title
                it[description] = task.description
                it[createdDate] = task.createdDate
                it[dueDate] = task.dueDate
                it[creatorId] = task.creatorId
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

