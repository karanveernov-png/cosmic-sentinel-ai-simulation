/**
 * Core incident domain model.
 *
 * This shape is the contract between the frontend and the future FastAPI
 * backend. Keep it stable — UI components should only ever depend on these
 * types, never on the shape of the mock data files directly.
 */

export type IncidentCategory =
  | 'space_weather'
  | 'earth_disaster'
  | 'communication_anomaly'
  | 'satellite_service'
  | 'other';

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Verification is independent from priority. A simulated incident can carry
 * a high demonstration priority without being a real-world event, and an
 * unverified report can still be worth monitoring closely.
 */
export type VerificationState = 'verified' | 'unverified' | 'simulated';

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Human-readable precision note, e.g. "approximate region centroid". */
  precision?: string;
}

export interface DataQuality {
  /** 0–100 confidence in the underlying report. */
  confidenceScore: number;
  /** Short note explaining what limits confidence, if anything. */
  limitation?: string;
}

export interface IncidentRelationship {
  relatedIncidentId: string;
  relationshipType: 'geographic_overlap' | 'temporal_overlap' | 'service_dependency';
  description: string;
}

export interface Incident {
  id: string;
  title: string;
  category: IncidentCategory;
  region: string;
  /** ISO 8601 timestamp of when the incident was first reported. */
  reportedAt: string;
  /** ISO 8601 timestamp of the most recent update, if any. */
  updatedAt?: string;
  source: string;
  verification: VerificationState;
  priority: IncidentPriority;
  /** Base severity 0–100 before any compound adjustment, set by the source rules. */
  baseSeverity: number;
  description: string;
  coordinates?: GeoPoint;
  dataQuality: DataQuality;
  relationships: IncidentRelationship[];
  /** True once this incident has been part of a compound-threat evaluation. */
  isCompound: boolean;
}

export interface ActivityEvent {
  id: string;
  type: 'incident_received' | 'incident_updated' | 'relationship_identified' | 'verification_changed' | 'incident_resolved';
  incidentId?: string;
  message: string;
  /** ISO 8601 timestamp. */
  timestamp: string;
}
