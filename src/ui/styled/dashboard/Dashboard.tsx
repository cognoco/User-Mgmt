import React from "react";
// Already uses the headless dashboard implementation
import { Dashboard as HeadlessDashboard } from "@/src/ui/headless/dashboard/Dashboard"83;

export const Dashboard: React.FC = () => (
  <HeadlessDashboard>
    {({
      items,
      isEditing,
      currentItem,
      error,
      setIsEditing,
      setCurrentItem,
      handleCreate,
      handleUpdate,
      handleDelete,
    }) => (
      <div>
        {error && <div role="alert">{error}</div>}

        <button onClick={() => setIsEditing(true)}>Create New</button>

        {isEditing && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const title = (
                form.elements.namedItem("title") as HTMLInputElement
              ).value;
              const description = (
                form.elements.namedItem("description") as HTMLInputElement
              ).value;

              if (currentItem) {
                handleUpdate(currentItem.id, title, description);
              } else {
                handleCreate(title, description);
              }
            }}
          >
            <div>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                defaultValue={currentItem?.title || ""}
              />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <input
                id="description"
                name="description"
                defaultValue={currentItem?.description || ""}
              />
            </div>
            <button type="submit">Save</button>
          </form>
        )}

        {items.length === 0 ? (
          <div>No items found</div>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <button
                  onClick={() => {
                    setCurrentItem(item);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    /* istanbul ignore next */
                    if (window.confirm("Are you sure?")) {
                      handleDelete(item.id);
                    }
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )}
  </HeadlessDashboard>
);
