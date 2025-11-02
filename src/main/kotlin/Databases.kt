package net.raphdf201

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import org.jetbrains.exposed.sql.Database

fun Application.configureDatabases() {
    val database =
        Database.connect(
            url = "jdbc:mariadb://raw.raphdf201.net:3306/taskmanager",
            user = "taskmgr",
            driver = "org.mariadb.jdbc.Driver",
            password = "TaskManagerPw124!",
        )

    val databaseService = DatabaseService(database)
    routing {
        get("/tasks") {
            val tasks = databaseService.getTasks()
            call.respond(tasks)
        }

        post("/tasks") {
            val task = call.receive<ExposedTask>()
            val id = databaseService.createTask(task)
            call.respond(HttpStatusCode.Created, id)
        }

        get("/users") {
            val users = databaseService.getUsers()
            call.respond(users)
        }

        post("/users") {
            val user = call.receive<ExposedUser>()
            val id = databaseService.createUser(user)
            call.respond(HttpStatusCode.Created, id)
        }

        get("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            val user = databaseService.getUser(id)
            if (user != null) {
                call.respondText(Json.encodeToString(user))
            } else {
                call.respond(HttpStatusCode.NotFound)
            }
        }

        put("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            val user = call.receive<ExposedUser>()
            databaseService.updateUser(id, user)
            call.respond(HttpStatusCode.OK)
        }

        delete("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            databaseService.deleteUser(id)
            call.respond(HttpStatusCode.OK)
        }

        delete("/tasks/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            databaseService.deleteTask(id)
            call.respond(HttpStatusCode.OK)
        }
    }
}
