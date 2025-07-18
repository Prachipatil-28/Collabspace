import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import JitsiComponent from './JitsiComponent';
import api from '../../../api/api';
import toast from 'react-hot-toast';

const VideoCall = ({ workspace, isOwner, currentUser, getUserDisplayName }) => {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(currentUser.username);
  const [startMeeting, setStartMeeting] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [inviteAll, setInviteAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generate random room ID
  const generateRoomId = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
  };

  // Handle meeting creation
  const handleCreateMeeting = () => {
    if (!roomId || !password) {
      toast.error('Please generate a room ID and set a password.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setStartMeeting(true);
      setIsLoading(false);
    }, 1000); // Simulate loading
  };

  // Handle sending invites
  const handleSendInvite = async () => {
    if (!roomId || !password) {
      toast.error('Room ID and password are required.');
      return;
    }
    if (!inviteAll && !selectedParticipant) {
      toast.error('Please select a participant or choose to invite all.');
      return;
    }

    setIsLoading(true);
    try {
      const recipients = inviteAll
        ? workspace.participants
        : [selectedParticipant];

      const payload = {
        workspaceId: workspace.workspaceId,
        roomId,
        password,
        recipients,
      };

      await api.post(`/api/workspace/${workspace.workspaceId}/video-call/invite`, payload);
      toast.success('Invitations sent successfully!');
      setSelectedParticipant('');
      setInviteAll(false);
    } catch (error) {
      console.error('Error sending invites:', error);
      toast.error('Failed to send invitations.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-pink-600 dark:text-pink-400">
        Video Conference
      </h2>
      <div className="bg-white dark:bg-gradient-to-r dark:from-pink-200 dark:to-purple-200 p-6 rounded-xl shadow-xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 dark:border-pink-400"></div>
          </div>
        ) : !startMeeting ? (
          <div className="space-y-6">
            {isOwner ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Room ID
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={roomId}
                      readOnly
                      placeholder="Generate a Room ID"
                      className="flex-1 bg-gray-100 dark:bg-pink-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                    />
                    <button
                      onClick={generateRoomId}
                      className="bg-pink-600 dark:bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a password"
                    className="w-full bg-gray-100 dark:bg-pink-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                    Invite Participants
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="inviteAll"
                        checked={inviteAll}
                        onChange={() => {
                          setInviteAll(true);
                          setSelectedParticipant('');
                        }}
                        className="text-pink-600 dark:text-pink-400 focus:ring-pink-500 dark:focus:ring-pink-400"
                      />
                      <label htmlFor="inviteAll" className="text-gray-700 dark:text-gray-800">
                        Invite All Participants
                      </label>
                    </div>
                    {workspace.participants.map((email) => (
                      <div key={email} className="flex items-center gap-3">
                        <input
                          type="radio"
                          id={email}
                          value={email}
                          checked={selectedParticipant === email}
                          onChange={(e) => {
                            setSelectedParticipant(e.target.value);
                            setInviteAll(false);
                          }}
                          className="text-pink-600 dark:text-pink-400 focus:ring-pink-500 dark:focus:ring-pink-400"
                        />
                        <img
                          src={`https://ui-avatars.com/api/?name=${email}&background=ff6bcb&color=fff&size=32`}
                          alt={`${email} avatar`}
                          className="w-8 h-8 rounded-full"
                        />
                        <label htmlFor={email} className="text-gray-700 dark:text-gray-800">
                          {email}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleSendInvite}
                    className="bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center"
                  >
                    Send Invite
                  </button>
                  <button
                    onClick={handleCreateMeeting}
                    className="bg-pink-600 dark:bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors flex items-center"
                  >
                    Start Meeting
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-gray-600 dark:text-gray-800 mb-6">
                  Only the workspace owner can create a meeting. Please enter the Room ID and Password
                  provided by the owner to join.
                </p>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter Room ID"
                      className="w-full bg-gray-100 dark:bg-pink-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                      Password
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter Password"
                      className="w-full bg-gray-100 dark:bg-pink-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-800 mb-2">
                      Your Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter Your Display Name"
                      className="w-full bg-gray-100 dark:bg-pink-100 border-none rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (roomId && password && displayName) {
                        setIsLoading(true);
                        setTimeout(() => {
                          setStartMeeting(true);
                          setIsLoading(false);
                        }, 1000);
                      } else {
                        toast.error('Please fill in all fields.');
                      }
                    }}
                    className="bg-pink-600 dark:bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors"
                  >
                    Join Meeting
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <JitsiComponent roomName={roomId} displayName={displayName} password={password} />
        )}
      </div>
    </div>
  );
};

export default VideoCall;