import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addTalkHistory } from '../../redux/actions/speechActions';

const Sidebar = ({ onSelect }) => {
  const dispatch = useDispatch();
  const history = useSelector((state) => state.history);
  const [newTalk, setNewTalk] = useState('');

  const handleAddTalk = () => {
    if (newTalk.trim()) {
      dispatch(addTalkHistory({ label: newTalk }));
      setNewTalk('');
    }
  };

  return (
    <div className="w-1/4 p-6 border-r border-gray-300 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-cyan-700 mb-6 text-center">Talk History</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={newTalk}
          onChange={(e) => setNewTalk(e.target.value)}
          placeholder="Add new talk"
          className="border border-gray-300 p-2 rounded w-full"
        />
        <button
          onClick={handleAddTalk}
          className="mt-2 bg-cyan-600 text-white p-2 rounded w-full hover:bg-cyan-700 transition"
        >
          Add Talk
        </button>
      </div>

      <ul className="space-y-4">
        {history?.length > 0 ? (
          history.map((talk, index) => (
            <li
              key={index}
              className="cursor-pointer hover:bg-cyan-100 p-3 rounded-lg transition transform hover:scale-105"
              onClick={() => onSelect(talk)}
            >
              <span className="font-semibold">{talk.label}</span>
            </li>
          ))
        ) : (
          <li className="text-gray-500 text-center">No history available.</li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
