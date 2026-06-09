import { Star } from "lucide-react";

export default function Stars({ n }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          fill={i <= n ? "#f5a623" : "none"}
          color={i <= n ? "#f5a623" : "#d1d5db"}
        />
      ))}
    </div>
  );
}
