package net.raphdf201

class Constants {
    class Database {
        companion object {
            const val url = "jdbc:mariadb://raw.raphdf201.net:3306/taskmanager"
            const val user = "taskmgr"
            const val driver = "org.mariadb.jdbc.Driver"
            const val password = "TaskManagerPw124!"
        }
    }

    class Auth {
        companion object {
            const val callback = "https://commtasks.raphdf201.net/callback"
            const val name = "google"
            const val authorizeUrl = "https://accounts.google.com/o/oauth2/auth"
            const val accessTokenUrl = "https://accounts.google.com/o/oauth2/token"
            const val clientId = "963962680553-ju8joh4ct4qeevmu4n132t48slk77vq5.apps.googleusercontent.com"
            const val clientSecret = "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"
            val defaultScopes = listOf("https://www.googleapis.com/auth/userinfo.profile")
        }
    }
}
