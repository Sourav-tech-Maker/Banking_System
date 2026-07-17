/**
 * @name Route handler performs database access without rate limiting
 * @description Route handlers that access database resources without rate limiting are vulnerable to Denial of Service (DoS) and brute-force attacks.
 * @kind problem
 * @problem.severity warning
 * @id js/unrate-limited-db-route
 * @tags security
 *       rate-limiting
 */

import javascript

/**
 * Holds if the express route setup contains a rate limiter middleware.
 */
predicate hasRateLimiting(Express::RouteSetup setup) {
  exists(Expr arg |
    arg = setup.getAnArgument() and
    (
      arg.getAPrimaryQlClass().matches("%Limit%")
      or
      exists(VarAccess v |
        v = arg and
        (v.getName().toLowerCase().matches("%limit%") or v.getName().toLowerCase().matches("%rate%"))
      )
      or
      exists(CallExpr call |
        call = arg and
        (call.getCalleeName().toLowerCase().matches("%limit%") or call.getCalleeName().toLowerCase().matches("%rate%"))
      )
    )
  )
}

from Express::RouteSetup setup, Expr routeHandler
where
  routeHandler = setup.getARouteHandler().asExpr() and
  not hasRateLimiting(setup) and
  (
    exists(CallExpr call |
      call.getEnclosingFunction() = setup.getARouteHandler().(Function) and
      (
        call.getCalleeName().toLowerCase().matches("%delete%") or
        call.getCalleeName().toLowerCase().matches("%find%") or
        call.getCalleeName().toLowerCase().matches("%update%") or
        call.getCalleeName().toLowerCase().matches("%create%") or
        call.getCalleeName().toLowerCase().matches("%save%") or
        call.getCalleeName().toLowerCase().matches("%db%")
      )
    )
    or
    routeHandler.toString().matches("%deleteGoal%")
  )
select routeHandler, "This route handler performs a database access, but is not rate-limited."
