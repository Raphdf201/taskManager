package net.raphdf201

import io.ktor.client.HttpClient
import io.ktor.client.engine.apache.Apache
import io.ktor.http.HttpMethod
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.auth.OAuthAccessTokenResponse
import io.ktor.server.auth.OAuthServerSettings
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.authentication
import io.ktor.server.auth.oauth
import io.ktor.server.response.respondRedirect
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import io.ktor.server.sessions.Sessions
import io.ktor.server.sessions.clear
import io.ktor.server.sessions.cookie
import io.ktor.server.sessions.sessions
import io.ktor.server.sessions.set
import kotlinx.serialization.Serializable

fun Application.configureSecurity() {
    install(Sessions) {
        cookie<UserSession>("techTaskManager") {
            cookie.extensions["SameSite"] = "lax"
        }
    }
    authentication {
        oauth("auth-oauth-google") {
            urlProvider = { Constants.Auth.callback }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = Constants.Auth.name,
                    authorizeUrl = Constants.Auth.authorizeUrl,
                    accessTokenUrl = Constants.Auth.accessTokenUrl,
                    requestMethod = HttpMethod.Post,
                    clientId = Constants.Auth.clientId,
                    clientSecret = Constants.Auth.clientSecret,
                    defaultScopes = Constants.Auth.defaultScopes
                )
            }
            client = HttpClient(Apache)
        }
    }

    routing {
        authenticate("auth-oauth-google") {
            get("/login") {
                // OAuth will handle the redirect automatically
            }

            get("/callback") {
                val principal: OAuthAccessTokenResponse.OAuth2? = call.authentication.principal()
                if (principal != null) {
                    call.sessions.set(UserSession(
                        isLoggedIn = true,
                        accessToken = principal.accessToken
                    ))
                    call.respondRedirect("/testLogin")
                } else {
                    call.respondRedirect("/login")
                }
            }
        }

        get("/logout") {
            call.sessions.clear<UserSession>()
            call.respondRedirect("/")
        }
    }
}

@Serializable
data class UserSession(
    val isLoggedIn: Boolean = false,
    val accessToken: String? = null
)
