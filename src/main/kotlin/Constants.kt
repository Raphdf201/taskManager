package net.raphdf201

class Constants {
    class Database {
        companion object {
            const val URL = "jdbc:mariadb://192.168.1.14:3306/taskmanager"
            const val USER = "taskmgr"
            const val DRIVER = "org.mariadb.jdbc.Driver"
            const val PASSWORD = "TaskManagerPw124!"
        }
    }

    class Auth {
        companion object {
            const val CALLBACK = "https://commtasks.raphdf201.net/callback"
            const val NAME = "google"
            const val AUTHORIZEURL = "https://accounts.google.com/o/oauth2/auth"
            const val ACCESSTOKENURL = "https://accounts.google.com/o/oauth2/token"
            const val CLIENTID = "963962680553-ju8joh4ct4qeevmu4n132t48slk77vq5.apps.googleusercontent.com"
            const val CLIENTSECRET = "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"
            val DEFAULTSCOPES = listOf("https://www.googleapis.com/auth/userinfo.profile")
        }
    }
}
