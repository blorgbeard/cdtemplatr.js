'use strict';

module.exports = function(username, ldapProfile) {
  return ldapProfile && {
    _id: username,
    username: username,
    displayName: ldapProfile.displayName,
    thumbnailPhoto: "data:image/jpeg;base64," + ldapProfile.thumbnailPhoto.toString("base64"),
    email: ldapProfile.mail,
    title: ldapProfile.title,
    cached: new Date()
  } || {
    _id: username,
    username: username,
    displayName: username,
    thumbnailPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAA21BMVEX///8AAAA3NzcFBQVJSUkwMDBNTU0yMjItLS00NDRBQUElJSX8/Pxqamo5OTnZ2dk9PT0KCgohISHp6enc3NzW1tbBwcGlpaViYmJPT0/5+fnl5eXT09PPz8+7u7t3d3dsbGxmZmZXV1dGRkby8vKWlpaJiYlLS0soKCgWFhb29vbu7u7e3t7Dw8O1tbWxsbGNjY2Dg4N/f392dnZxcXFgYGBcXFxTU1MQEBDi4uLFxcWpqamfn5+enp6dnZ2YmJiQkJB6enpwcHDKysrHx8d0dHRZWVk/Pz8RERHy+XUGAAABi0lEQVQ4y3XR6XKiQBSG4fOJiDiIMMqq7O4x7lv2ZSbL/V9RDlYloWN4fjT8eLvrdDUJbmdE/UGfyrQQEzm4pVJxm8h3p1RiZkUtFrUu6FdX+CT/PkCoqqqSk0e9Dp3pQnBWBCNAqo7BjoYJZDYJ5jsV+E9aDfjbps475MMlFfiqrmLMPzdAxJ8UcqWhCQPoCswu0RaoEml1DtAtBFq1ovDhqx1YOsjAwUGjgumdDHCSm4DJS58EYR5MBlGSNO9PgUMizYYg9Okny/3z5SWgM01Pr38xvIREwVCviIYhFVwkxvV+7j6sl3fx3L327PTf5O370XtDyONHY5VtU/d5NMwelXt9YKp46tCJczAgA5AKAKhQNm1iT5KeB41nr/YtHuVB3bSJfHMZcSDFEOyOHKxrCg8Aa8XBxINAH3PwsECfbLQ1a59hY6JA2kB3Ay1Ahy6RT9KE+Vot2B/RyO/HgQXrFJzJg3x3r2+XB+FNl64cpzxYtGZEjaQ8SD1etnp5UF/z4phaWTCVFvQBS+AjxJ2HhMkAAAAASUVORK5CYII=",
    email: null,
    title: "user",
    cached: new Date()
  };
};
