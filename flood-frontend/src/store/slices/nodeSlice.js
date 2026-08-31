
import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import {
  getNodes,
  getNodeById,
  createNode,
  updateNode,
  deleteNode,
} from "../../api/nodeApi";

// =========================================================
// FETCH ALL NODES
// =========================================================

export const fetchNodes = createAsyncThunk(
  "nodes/fetchNodes",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getNodes();

      return response.nodes || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch nodes"
      );
    }
  }
);

// =========================================================
// FETCH SINGLE NODE
// =========================================================

export const fetchNodeById = createAsyncThunk(
  "nodes/fetchNodeById",

  async (id, { rejectWithValue }) => {
    try {
      const response = await getNodeById(id);

      return response.node;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch node"
      );
    }
  }
);

// =========================================================
// CREATE NODE
// =========================================================

export const addNode = createAsyncThunk(
  "nodes/addNode",

  async (nodeData, { rejectWithValue }) => {
    try {
      const response = await createNode(nodeData);

      return response.node;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create node"
      );
    }
  }
);

// =========================================================
// UPDATE NODE
// =========================================================
//
// IMPORTANT:
// Component sends:
//
// editNode({
//   id: editingNode.id,
//   data: payload
// })
//
// Therefore this thunk uses { id, data }.
// =========================================================

export const editNode = createAsyncThunk(
  "nodes/editNode",

  async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Node ID is required"
        );
      }

      if (!data || typeof data !== "object") {
        return rejectWithValue(
          "Node update data is required"
        );
      }

      const response = await updateNode(
        id,
        data
      );

      return response.node;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update node"
      );
    }
  }
);

// =========================================================
// DELETE NODE
// =========================================================

export const removeNode = createAsyncThunk(
  "nodes/removeNode",

  async (id, { rejectWithValue }) => {
    try {
      if (!id) {
        return rejectWithValue(
          "Node ID is required"
        );
      }

      await deleteNode(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete node"
      );
    }
  }
);

// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  nodes: [],

  selectedNode: null,

  loading: false,

  detailsLoading: false,

  saving: false,

  deleting: false,

  error: null,

  detailsError: null,
};

// =========================================================
// SLICE
// =========================================================

const nodeSlice = createSlice({
  name: "nodes",

  initialState,

  reducers: {
    // -----------------------------------------------------
    // CLEAR GENERAL ERROR
    // -----------------------------------------------------

    clearNodeError: (state) => {
      state.error = null;
    },

    // -----------------------------------------------------
    // CLEAR DETAILS ERROR
    // -----------------------------------------------------

    clearNodeDetailsError: (state) => {
      state.detailsError = null;
    },

    // -----------------------------------------------------
    // CLEAR SELECTED NODE
    // -----------------------------------------------------

    clearSelectedNode: (state) => {
      state.selectedNode = null;
      state.detailsError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===================================================
      // FETCH ALL NODES
      // ===================================================

      .addCase(
        fetchNodes.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchNodes.fulfilled,
        (state, action) => {
          state.loading = false;

          state.nodes =
            Array.isArray(action.payload)
              ? action.payload
              : [];
        }
      )

      .addCase(
        fetchNodes.rejected,
        (state, action) => {
          state.loading = false;

          state.error =
            action.payload ||
            "Failed to fetch nodes";
        }
      )

      // ===================================================
      // FETCH SINGLE NODE
      // ===================================================

      .addCase(
        fetchNodeById.pending,
        (state) => {
          state.detailsLoading = true;
          state.detailsError = null;
        }
      )

      .addCase(
        fetchNodeById.fulfilled,
        (state, action) => {
          state.detailsLoading = false;

          state.selectedNode =
            action.payload || null;
        }
      )

      .addCase(
        fetchNodeById.rejected,
        (state, action) => {
          state.detailsLoading = false;

          state.selectedNode = null;

          state.detailsError =
            action.payload ||
            "Failed to fetch node";
        }
      )

      // ===================================================
      // CREATE NODE
      // ===================================================

      .addCase(
        addNode.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        addNode.fulfilled,
        (state, action) => {
          state.saving = false;

          if (action.payload) {
            state.nodes.unshift(
              action.payload
            );
          }
        }
      )

      .addCase(
        addNode.rejected,
        (state, action) => {
          state.saving = false;

          state.error =
            action.payload ||
            "Failed to create node";
        }
      )

      // ===================================================
      // UPDATE NODE
      // ===================================================

      .addCase(
        editNode.pending,
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )

      .addCase(
        editNode.fulfilled,
        (state, action) => {
          state.saving = false;

          const updatedNode =
            action.payload;

          if (!updatedNode) {
            return;
          }

          // Find node in list
          const index =
            state.nodes.findIndex(
              (node) =>
                node.id ===
                updatedNode.id
            );

          // Replace updated node
          if (index !== -1) {
            state.nodes[index] =
              updatedNode;
          }

          // Update selected node if
          // currently selected
          if (
            state.selectedNode?.id ===
            updatedNode.id
          ) {
            state.selectedNode =
              updatedNode;
          }
        }
      )

      .addCase(
        editNode.rejected,
        (state, action) => {
          state.saving = false;

          state.error =
            action.payload ||
            "Failed to update node";
        }
      )

      // ===================================================
      // DELETE NODE
      // ===================================================

      .addCase(
        removeNode.pending,
        (state) => {
          state.deleting = true;
          state.error = null;
        }
      )

      .addCase(
        removeNode.fulfilled,
        (state, action) => {
          state.deleting = false;

          const deletedId =
            action.payload;

          state.nodes =
            state.nodes.filter(
              (node) =>
                node.id !== deletedId
            );

          // Clear selected node if
          // deleted node was selected
          if (
            state.selectedNode?.id ===
            deletedId
          ) {
            state.selectedNode = null;
          }
        }
      )

      .addCase(
        removeNode.rejected,
        (state, action) => {
          state.deleting = false;

          state.error =
            action.payload ||
            "Failed to delete node";
        }
      );
  },
});

// =========================================================
// ACTIONS
// =========================================================

export const {
  clearNodeError,
  clearNodeDetailsError,
  clearSelectedNode,
} = nodeSlice.actions;

// =========================================================
// SELECTORS
// =========================================================

export const selectNodes = (state) =>
  state.nodes.nodes;

export const selectSelectedNode = (state) =>
  state.nodes.selectedNode;

export const selectNodesLoading = (state) =>
  state.nodes.loading;

export const selectNodeDetailsLoading = (
  state
) => state.nodes.detailsLoading;

export const selectNodesSaving = (state) =>
  state.nodes.saving;

export const selectNodesDeleting = (state) =>
  state.nodes.deleting;

export const selectNodesError = (state) =>
  state.nodes.error;

export const selectNodeDetailsError = (
  state
) => state.nodes.detailsError;

// =========================================================
// REDUCER
// =========================================================

export default nodeSlice.reducer;
