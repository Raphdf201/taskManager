package net.raphdf201

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.get
import io.ktor.server.sessions.sessions
import org.jetbrains.exposed.sql.Database

fun Application.configureDatabases() {
    val db = DatabaseService(
        Database.connect(
            url = Constants.Database.URL,
            user = Constants.Database.USER,
            driver = Constants.Database.DRIVER,
            password = Constants.Database.PASSWORD,
        )
    )

    routing {
        get("/tasks") {
            val tasks = db.getTasks()
            call.respond(tasks)
        }

        post("/tasks") {
            val task = call.receive<ExposedTaskReceive>()
            call.authorizedActionWithMessage(HttpStatusCode.Created) {
                db.createTask(task)
            }
        }

        get("/users") {
            call.respond(db.getUsers())
        }

        post("/users") {
            val user = call.receive<ExposedUserReceive>()
            call.authorizedActionWithMessage(HttpStatusCode.Created) {
                db.createUser(user)
            }
        }

        get("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            val user = db.getUser(id)
            if (user != null) {
                call.respond(user)
            } else {
                call.respond(HttpStatusCode.NotFound)
            }
        }

        put("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            val user = call.receive<ExposedUserSend>()
            call.authorizedAction {
                db.updateUser(id, user)
            }
        }

        put("/tasks/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            val task = call.receive<ExposedTaskReceive>()
            call.authorizedAction(message = task) {
                db.updateTask(id, task)
            }
        }

        delete("/users/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteUser(id)
            }
        }

        delete("/tasks/{id}") {
            val id = call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID")
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteTask(id)
            }
        }

        get("/testLogin") {
            val session = call.sessions.get<UserSession>()
            call.respondText("tk : ${session?.accessToken}<br>lgin : ${session?.isLoggedIn}",
                ContentType.Text.Html)
        }

        get("/isLoggedIn") {
            call.respond(if (call.isLoggedIn()) HttpStatusCode.OK else HttpStatusCode.Unauthorized)
        }
    }
}
