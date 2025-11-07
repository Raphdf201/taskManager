package net.raphdf201

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import org.jetbrains.exposed.sql.Database

lateinit var db: DatabaseService

fun Application.configureDatabases() {
    db = DatabaseService(
        Database.connect(
            Constants.Database.URL,
            Constants.Database.DRIVER,
            Constants.Database.USER,
            Constants.Database.PASSWORD,
        )
    )

    routing {
        get("/") {
            if (call.isLoggedIn()) call.respondRedirect(Constants.Static.TASKS)
            else call.respondRedirect(Constants.Static.LOGIN)
        }

        get("/tasks") {
            call.authorizedActionWithMessage {
                db.getTasks()
            }
        }

        post("/tasks") {
            val task = call.receive<ExposedTaskReceive>()
            if (task.creatorId.isBlank()) call.respond(HttpStatusCode.BadRequest)
            call.authorizedActionWithMessage(HttpStatusCode.Created) {
                db.createTask(task)
            }
        }

        get("/users") {
            call.authorizedActionWithMessage {
                db.getUsers()
            }
        }

        get("/users/{id}") {
            val id = call.parameters["id"]
            val user = db.getUser(id)
            if (user != null) {
                call.respond(user)
            } else {
                call.respond(HttpStatusCode.NotFound)
            }
        }

        put("/users/{id}") {
            val id = call.parameters["id"]
            val user = call.receive<ExposedUser>()
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
            val id = call.parameters["id"]
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
            call.respondText(
                "tk : ${session?.accessToken}<br>lgin : ${session?.isLoggedIn}",
                ContentType.Text.Html
            )
        }

        get("/isLoggedIn") {
            call.respond(if (call.isLoggedIn()) HttpStatusCode.OK else HttpStatusCode.Unauthorized)
        }
    }
}
