package net.raphdf201

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.delete
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import io.ktor.server.routing.put
import io.ktor.server.routing.routing
import org.jetbrains.exposed.sql.Database

fun Application.configureDatabases() {
    val database = Database.connect(
        url = "jdbc:mariadb://192.168.1.14:3306/taskmanager",
        user = "root",
        driver = "org.mariadb.jdbc.Driver",
        password = "TaskManagerPw123!",
    )
    val databaseService = DatabaseService(database)
    routing {
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
    }
}
