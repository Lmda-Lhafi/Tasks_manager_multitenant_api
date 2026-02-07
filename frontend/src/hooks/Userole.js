export const useRole = (userRole) => {
  const isAdmin = userRole === "admin";
  const isUser = userRole === "user";
  
  const canAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };
  
  return { isAdmin, isUser, canAccess };
};