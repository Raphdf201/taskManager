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
            call.respondRedirect(Constants.Static.FRONTEND)
        }

        get("/tasks") {
            call.authorizedActionWithMessage {
                db.getTasks()
            }
        }

        get("/tasks/{id}") {
            val task = db.getTask(call.parameters["id"]?.toInt())
            if (task != null) call.respond(task)
            else call.respond(HttpStatusCode.NotFound)
        }

        post("/tasks") {
            val task = call.receive<ExposedTaskReceive>()
            call.authorizedActionWithMessage(HttpStatusCode.Created) {
                db.createTask(task)
            }
        }

        put("/tasks/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.updateTask(
                    call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"),
                    call.receive<ExposedTaskReceive>()
                )
            }
        }

        delete("/tasks/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteTask(call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"))
            }
        }

        get("/users") {
            call.authorizedActionWithMessage {
                db.getUsers()
            }
        }

        get("/users/{id}") {
            val user = db.getUser(call.parameters["id"])
            if (user != null) call.respond(user)
            else call.respond(HttpStatusCode.NotFound)
        }

        put("/users/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.updateUser(call.parameters["id"], call.receive<ExposedUser>())
            }
        }

        delete("/users/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteUser(call.parameters["id"])
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
