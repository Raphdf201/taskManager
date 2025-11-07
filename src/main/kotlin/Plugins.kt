package net.raphdf201

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.http.content.*
import io.ktor.server.plugins.compression.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.forwardedheaders.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.sessions.*

fun Application.configurePlugins() {
    install(ForwardedHeaders)
    install(XForwardedHeaders)
    install(Compression)
    install(ContentNegotiation) {
        json()
    }
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            val msg = "500: $cause"
            log(msg)
            call.respondText(msg, status = HttpStatusCode.InternalServerError)
        }
    }
    install(Sessions) {
        cookie<UserSession>("techTaskManager") {
            cookie.extensions["SameSite"] = "lax"
        }
    }

    routing {
        staticResources("/", "static")
        // openAPI("openapi", "documentation.yaml")
    }
}
