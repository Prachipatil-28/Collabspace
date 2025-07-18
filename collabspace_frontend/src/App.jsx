import { useState } from 'react'
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Common/navbar/navbar';
import  Footer  from './components/Common/footer/footer';
import LandingPage from './components/landingPage';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import ContactPage from './components/Common/contactPage/ContactPage';
import AboutPage from './components/Common/aboutPage/AboutPage';
import ResetPassword from './components/Auth/ResetPassword';
import Whiteboard from './components/Tools/Whiteboard/whiteboard';
import Editor from './components/Tools/CodeEditor/Editor';
import Dashboard from './components/user/Dashboard/Dashboard';
import Workspace from './components/Workspace/Workspace';
import GroupDashboard from './components/Workspace/GroupWorkspace/GroupWorkspace';
import IndividualDashboard from './components/Workspace/IndividualWorkspace/IndividualWorkspace';
import TeamDashboard from './components/Workspace/TeamWorkspace/TeamDashboard';
import CodeEditorDashboard from './components/Tools/CodeEditor/CodeEditorDash/CodeEditorDashboard';
import WorkspacePage from './components/Workspace/workspaceMain';
import SessionPage from './components/Workspace/Session/SessionPage';
import CollectionHome from './components/Workspace/MainContent/CollectionHome';
import SessionHome from './components/Workspace/MainContent/SessionHome';
import CollectionForm from './components/Workspace/MainContent/CollectionForm';
import SessionForm from './components/Workspace/MainContent/SessionForm';
import DefaultHome from './components/Workspace/MainContent/home';
import HomePage from './components/Workspace/homePage';
import EditorWindow from './components/Tools/CodeEditor/EditorWindow';
import Playground from './components/Workspace/IndividualWorkspace/Playground';
import WhiteboardPlayground from './components/Tools/Whiteboard/whiteboardPlayground';
import NotesPlayground from './components/Tools/Notes/NotesPlayground';
import Notepad from './components/Tools/Notes/Notes';
import Blogs from './components/LandingPageCom/blogs/blogs';
import BlogPost from './components/LandingPageCom/blogs/blogPost';
import UserProfile from './components/Auth/UserProfile';
import Resource from './components/LandingPageCom/Resource_Recomendation/resource_recomend';
import CollaborativeEditor from './components/Tools/Collab_editor/collaborative_editor';
import OAuth2RedirectHandler from './components/Auth/OAuth2RedirectHandler';

function App() {
  const [count, setCount] = useState(0);

  const hiddenPaths = ["/whiteboard","/codeEditor","/dashboard","/workspace","/individual","/codeEditorDash","/group","/workspace/:id","/workspace/group/:workspaceId"
    ,"/workspace/individual/:workspaceId","/workspace/team/:workspaceId" 
  ];

  const location = useLocation();

  const shouldHideLayout = hiddenPaths.includes(location.pathname);


  return (
    <> 
    {!shouldHideLayout && <Navbar />}
    <Toaster position="bottom-center" reverseOrder={false} />
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path='/profile' element={<UserProfile />} />
      <Route path='/resource' element={<Resource />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path='/whiteboard' element={<Whiteboard />} />
      <Route path='/codeEditor' element={<Editor /> } />
      <Route path='/dashboard' element= {<Dashboard />} />
      <Route path='/workspace' element= {<Workspace />} />
      <Route path="/workspace/:id/session/:sessionId" element={<SessionPage />} />
      <Route path="/codeEditorDash" element={<CodeEditorDashboard />} />

      
          <Route path="/" element={<Workspace />} />
          <Route path="/workspace/individual/:workspaceId" element={<IndividualDashboard />} />
          <Route path="/workspace/group/:workspaceId" element={<GroupDashboard />} />
          <Route path="/workspace/team/:workspaceId" element={<TeamDashboard />} />
          <Route path="/playground/:workspaceId/notes" element={<NotesPlayground />} />
          <Route path="/playground/:workspaceId/collab-editor" element={<CollaborativeEditor />} />
          <Route path="/playground/:workspaceId/:type" element={<Playground />} />
          <Route path="/playground/:workspaceId/:type/new" element={<EditorWindow isCollaborative={false} />} />
          <Route path="/editor/:workspaceId/:fileName" element={<EditorWindow isCollaborative={false} />} />
          <Route path="/whiteboard-playground/:workspaceId" element={<WhiteboardPlayground />} />
           <Route path="/whiteboard/:workspaceId/:boardName" element={<Whiteboard isCollaborative={false} />} />
           <Route path="/code-editor/:workspaceId/:sessionId" element={<EditorWindow />} />

           <Route path="/notes-playground/:workspaceId" element={<NotesPlayground />} />
    <Route path="/notepad/:workspaceId/:noteName" element={<Notepad isCollaborative={false} />} />
    <Route path="/blogs" element={<Blogs />} />
    <Route path="/blog/:workspaceId/:noteName" element={<BlogPost />} />
    

      <Route path="/workspace/:id" element={<WorkspacePage />}>
  <Route index element={<HomePage/>} />
  <Route path="workspace/home" element={<HomePage onSave={(data) => console.log(data)} />} />
  <Route path="sessions/new" element={<SessionForm onSave={(data) => console.log(data)} />} />
  <Route path="collections/:collectionId" element={<CollectionHome />} />
  <Route path="sessions/:sessionId" element={<SessionHome />} />
</Route>
          
        

     {/* <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <AllNotes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-note"
        element={
          <ProtectedRoute>
            <CreateNote />
          </ProtectedRoute>
        }
      />
      
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute adminPage={true}>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      /> 
        <Route path="*" element={<NotFound />} /> 
      */}
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

    
    </Routes>
    {!shouldHideLayout && <Footer />}
    </>
);
}



export default App
