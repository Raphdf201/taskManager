package net.raphdf201

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*
import kotlinx.serialization.json.Json
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
            val caca = Json.encodeToString(db.getUsers())
            println(caca)
            call.respondText(caca, ContentType.Application.Json)
        }

        get("/users/{id}") {
            val user = db.getUser(call.parameters["id"])
            if (user != null) call.respond(user)
            else call.respond(HttpStatusCode.NotFound)
        }

        put("/users/{id}") {
            call.authorizedAction {
                db.updateUser(call.parameters["id"], call.receive<ExposedUser>())
            }
        }

        put("/tasks/{id}") {
            val task = call.receive<ExposedTaskReceive>()
            call.authorizedAction(message = task) {
                db.updateTask(
                    call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"),
                    task
                )
            }
        }

        delete("/users/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteUser(call.parameters["id"])
            }
        }

        delete("/tasks/{id}") {
            call.authorizedAction(HttpStatusCode.NoContent) {
                db.deleteTask(call.parameters["id"]?.toInt() ?: throw IllegalArgumentException("Invalid ID"))
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
