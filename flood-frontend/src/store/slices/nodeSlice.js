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
      const response = await createNode(
        nodeData
      );

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

export const editNode = createAsyncThunk(
  "nodes/editNode",

  async (
    { id, nodeData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateNode(
        id,
        nodeData
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
    clearNodeError: (state) => {
      state.error = null;
    },

    clearNodeDetailsError: (state) => {
      state.detailsError = null;
    },

    clearSelectedNode: (state) => {
      state.selectedNode = null;
      state.detailsError = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ===================================================
      // FETCH NODES
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
          state.nodes = action.payload;
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
            action.payload;
        }
      )

      .addCase(
        fetchNodeById.rejected,
        (state, action) => {
          state.detailsLoading = false;

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

          state.nodes.unshift(
            action.payload
          );
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

          const index =
            state.nodes.findIndex(
              (node) =>
                node.id ===
                updatedNode.id
            );

          if (index !== -1) {
            state.nodes[index] =
              updatedNode;
          }

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

          state.nodes =
            state.nodes.filter(
              (node) =>
                node.id !==
                action.payload
            );

          if (
            state.selectedNode?.id ===
            action.payload
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

export const selectSelectedNode = (
  state
) => state.nodes.selectedNode;

export const selectNodesLoading = (
  state
) => state.nodes.loading;

export const selectNodeDetailsLoading = (
  state
) => state.nodes.detailsLoading;

export const selectNodesSaving = (
  state
) => state.nodes.saving;

export const selectNodesDeleting = (
  state
) => state.nodes.deleting;

export const selectNodesError = (
  state
) => state.nodes.error;

export const selectNodeDetailsError = (
  state
) => state.nodes.detailsError;

export default nodeSlice.reducer;