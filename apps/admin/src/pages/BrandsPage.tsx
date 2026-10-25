import { useEffect, useState } from "react";
import {
  createBrand,
  deleteBrand,
  getBrands,
  updateBrand,
  type BrandRecord,
} from "../api/brands";

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRecord[]>([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  async function loadBrands() {
    try {
      setLoading(true);
      setError("");

      const response = await getBrands();
      setBrands(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load brands",
      );
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setName("");
    setCategory("");
    setDescription("");
    setLogoUrl("");
    setIsActive(true);
    setEditingId(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setError("");

      const payload = {
        name,
        category,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        isActive,
      };

      if (editingId) {
        await updateBrand(editingId, payload);
      } else {
        await createBrand(payload);
      }

      resetForm();
      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save brand",
      );
    }
  }

  function handleEdit(brand: BrandRecord) {
    setEditingId(brand.id);
    setName(brand.name);
    setCategory(brand.category);
    setDescription(brand.description ?? "");
    setLogoUrl(brand.logoUrl ?? "");
    setIsActive(brand.isActive);
  }

  async function handleToggle(brand: BrandRecord) {
    try {
      setError("");

      await updateBrand(brand.id, {
        isActive: !brand.isActive,
      });

      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update brand",
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this brand? Any linked offers may also be deleted.",
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteBrand(id);

      if (editingId === id) {
        resetForm();
      }

      await loadBrands();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete brand",
      );
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Brands</h1>
          <p>
            Manage brands participating in event promotions
            and customer attraction strategies.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form
        className="announcement-form"
        onSubmit={handleSubmit}
      >
        <div className="form-grid">
          <div>
            <label htmlFor="brand-name">Brand Name</label>

            <input
              id="brand-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Nike"
              required
            />
          </div>

          <div>
            <label htmlFor="brand-category">
              Category
            </label>

            <input
              id="brand-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="Sportswear"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="brand-description">
            Description
          </label>

          <textarea
            id="brand-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Sportswear and merchandise brand"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="brand-logo">
            Logo URL
          </label>

          <input
            id="brand-logo"
            value={logoUrl}
            onChange={(event) =>
              setLogoUrl(event.target.value)
            }
            placeholder="https://example.com/logo.png"
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) =>
              setIsActive(event.target.checked)
            }
          />

          Active
        </label>

        <div className="form-actions">
          <button type="submit">
            {editingId ? "Update Brand" : "Create Brand"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-card">
        {loading ? (
          <p>Loading brands...</p>
        ) : brands.length === 0 ? (
          <p>No brands created yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    <td>
                      <strong>{brand.name}</strong>

                      {brand.description && (
                        <div className="table-secondary-text">
                          {brand.description}
                        </div>
                      )}
                    </td>

                    <td>{brand.category}</td>

                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleToggle(brand)
                        }
                      >
                        {brand.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>
                    </td>

                    <td>
                      {new Date(
                        brand.createdAt,
                      ).toLocaleString()}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() =>
                            handleEdit(brand)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            handleDelete(brand.id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}