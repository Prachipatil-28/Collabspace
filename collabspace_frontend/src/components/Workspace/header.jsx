import React, { useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import { AppContext } from "../../store/AppContext";

const Header = () => {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useContext(AppContext);
  const location = useLocation(); // To get the current URL
  const navigate = useNavigate(); // To modify the URL with useNavigate
  const workspaceIdFromUrl = new URLSearchParams(location.search).get("workspaceId");

  useEffect(() => {
    // If workspaceId exists in URL, set it as active workspace
    if (workspaceIdFromUrl) {
      const workspace = workspaces.find((ws) => ws.workspaceId === workspaceIdFromUrl);
      if (workspace) {
        setActiveWorkspace(workspace);
      }
    }
  }, [workspaceIdFromUrl, workspaces, setActiveWorkspace]);

  const handleWorkspaceChange = (e) => {
    const selectedWorkspace = workspaces.find((ws) => ws.workspaceId === e.target.value);
    if (selectedWorkspace) {
      // Update the active workspace state
      setActiveWorkspace(selectedWorkspace);

      // Update the URL path directly to `/workspace/{new-id}`
      navigate(`/workspace/${selectedWorkspace.workspaceId}`, { replace: true });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-gray-200 text-gray-500 p-4 flex justify-between">
      <div className="font-bold text-lg">CollabSpace</div>
      <div className="relative inline-block w-64">
        
        {/* Arrow icon for select box */}
       <h1>{activeWorkspace.workspaceName}</h1>
      </div>
    </header>
  );
};

export default Header;
