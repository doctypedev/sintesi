use std::fmt;

#[derive(Debug)]
pub enum Error {
    Git(git2::Error),
    Reason(String),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Git(e) => write!(f, "Git error: {}", e),
            Error::Reason(s) => write!(f, "Error: {}", s),
        }
    }
}

impl std::error::Error for Error {}

impl From<git2::Error> for Error {
    fn from(err: git2::Error) -> Self {
        Error::Git(err)
    }
}

impl Error {
    pub fn from_reason(msg: impl Into<String>) -> Self {
        Error::Reason(msg.into())
    }
}
