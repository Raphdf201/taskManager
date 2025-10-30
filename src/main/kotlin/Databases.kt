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
                url = "jdbc:mariadb://192.168.1.14:3306/taskmanager",
                user = "taskmgr",
                driver = "org.mariadb.jdbc.Driver",
                password = "TaskManagerPw124!",
            )

    val databaseService = DatabaseService(database)
    routing {
        get("/tasks") {
            val tasks = databaseService.getTasks()
            call.respondText(Json.encodeToString(tasks), ContentType.Application.Json, HttpStatusCode.OK)
        }

        post("/tasks") {
            val task = call.receive<ExposedTask>()
            val id = databaseService.createTask(task)
            call.respond(HttpStatusCode.Created, id)
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
                call.respond(HttpStatusCode.OK, user)
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
