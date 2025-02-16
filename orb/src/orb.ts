interface RPoint {
  r: number;
  theta: number;
};

interface CPoint {
  x: number;
  y: number;
};

class CelestialObject {
  radius: number;
  max_tail_length: number;
  color: string;

  curr_tail_length: number = 0;

  getPosition: (t: number) => RPoint;
}

const SUN_RADIUS = 200;
class Sun extends CelestialObject {
  readonly radius = SUN_RADIUS / 10;
  readonly max_tail_length = 200;
  readonly color = "orange";

  getPosition = (_: number): RPoint => {
    return { r: 0, theta: 0 };
  }
};

/**
 *
Mercury: 57.9 million kilometers
Venus: 108.2 million kilometers
Earth: 149.6 million kilometers
Mars: 227.9 million kilometers
Jupiter: 778.3 million kilometers
Saturn: 1.43 billion kilometers
Uranus: 2.87 billion kilometers
Neptune: 4.5 billion kilometers
 *
 */

const EARTH_YEAR = 1 / 1000;

class Mercury extends CelestialObject {
  readonly radius = 5;
  readonly max_tail_length = 160;
  readonly color = "red";

  getPosition = (t: number): RPoint => {
    return { r: SUN_RADIUS + 57.9, theta: t * 3 * EARTH_YEAR };
  }
};

class Venus extends CelestialObject {
  readonly radius = 6;
  readonly max_tail_length = 200;
  readonly color = "grey";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 108.2,
      r: SUN_RADIUS + 120,
      theta: t * 2 * EARTH_YEAR
    };
  }
};


class Earth extends CelestialObject {
  readonly radius = 8;
  readonly max_tail_length = 400;
  readonly color = "blue";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 149.6,
      r: SUN_RADIUS + 225,
      theta: t * EARTH_YEAR
    };
  }
};

class Mars extends CelestialObject {
  readonly radius = 9;
  readonly max_tail_length = 850;
  readonly color = "red";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 227.9,
      r: SUN_RADIUS + 350,
      theta: t * 0.75 * EARTH_YEAR
    };
  }
};

class Jupiter extends CelestialObject {
  readonly radius = 12;
  readonly max_tail_length = 1000;
  readonly color = "orange";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 778.3,
      r: SUN_RADIUS + 550,
      theta: t * 0.5 * EARTH_YEAR
    };
  }
};

class Saturn extends CelestialObject {
  readonly radius = 13;
  readonly max_tail_length = 1500;
  readonly color = "orange";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 1430,
      r: SUN_RADIUS + 750,
      theta: t * 0.25 * EARTH_YEAR
    };
  }
};

class Uranus extends CelestialObject {
  readonly radius = 8;
  readonly max_tail_length = 3000;
  readonly color = "blue";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 2870,
      r: SUN_RADIUS + 950,
      theta: t * 0.125 * EARTH_YEAR
    };
  }
};

class Neptune extends CelestialObject {
  readonly radius = 7;
  readonly max_tail_length = 5250;
  readonly color = "blue";

  getPosition = (t: number): RPoint => {
    return {
      // r: SUN_RADIUS + 4500,
      r: SUN_RADIUS + 1200,
      theta: t * 0.08 * EARTH_YEAR
    };
  }
};

const PREVIOUS_POS_LENGTH = 100000;

export default class Orb {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  // Celestial objects in radial coordinates relative to the Sun
  celestialObjects: CelestialObject[];

  reference_id: number = 0;
  ref_translation: number = 1;
  next_reference: number = 0;
  ref_modified_ts: number = 0;

  prevPositions: Map<String, RPoint[]>;
  origins: CPoint[];
  timestamps: number[];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.celestialObjects = [];
    this.celestialObjects.push(new Sun());
    this.celestialObjects.push(new Mercury());
    this.celestialObjects.push(new Venus());
    this.celestialObjects.push(new Earth());
    this.celestialObjects.push(new Mars());
    this.celestialObjects.push(new Jupiter());
    this.celestialObjects.push(new Saturn());
    this.celestialObjects.push(new Uranus());
    this.celestialObjects.push(new Neptune());

    this.canvas.width = 1000;
    this.canvas.height = 1000;
    console.log(this.canvas.width, 'x', this.canvas.height);
    this.ctx = this.canvas.getContext("2d")!;

    this.prevPositions = new Map();
    for (let obj of this.celestialObjects) {
      const name = obj.constructor.name;
      this.prevPositions.set(name, []);
    }

    this.origins = [];
    this.timestamps = [];
  }


  set_reference(n: number) {
    if (n >= 0 && n < this.celestialObjects.length) {
      this.next_reference = n;
      this.ref_translation = 0;
    }
  }

  toCPoint(pos: RPoint): CPoint {
    return {
      x: (pos.r / 4) * Math.cos(pos.theta),
      y: (pos.r / 4) * Math.sin(pos.theta),
    }
  }

  draw(t: number) {
    // t = 0;
    // this.ctx.fillStyle = "black";
    // this.ctx.beginPath();
    // this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.fill();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // console.log("Draw", t);
    // Get the location from the reference
    let ref = this.celestialObjects[this.reference_id];
    let p = this.toCPoint(ref.getPosition(t));

    let ox = p.x;
    let oy = p.y;
    if (this.ref_translation != 1) {
      // Get the location from the next reference
      let nref = this.celestialObjects[this.next_reference];
      let n = this.toCPoint(nref.getPosition(t));

      ox = p.x * (1 - this.ref_translation) + n.x * this.ref_translation;
      oy = p.y * (1 - this.ref_translation) + n.y * this.ref_translation;

      this.ref_translation += 1 / 250;
      if (this.ref_translation >= 1) {
        this.ref_translation = 1;
        this.reference_id = this.next_reference;
        this.ref_modified_ts = t;
      }
    }
    let origin = { x: ox, y: oy };

    const sunRPointToScreenCoords = (pos: RPoint, origin: CPoint): CPoint => {
      const p = this.toCPoint(pos);
      // Translate to the reference's relative coords
      p.x -= origin.x;
      p.y -= origin.y;

      // Convert to screen coords
      p.x += this.canvas.width / 2;
      p.y += this.canvas.height / 2;

      return p;
    }

    // Draw tails
    for (let ci = 0; ci < this.celestialObjects.length; ci++) {
      const obj = this.celestialObjects[ci];
      // if (ci == this.reference_id && this.ref_translation == 1) {
      //   continue;
      // }
      this.ctx.strokeStyle = obj.color;


      const name = obj.constructor.name;
      const points = this.prevPositions.get(name);
      if (points.length <= 1) {
        continue;
      }

      let coords = sunRPointToScreenCoords(
        points[points.length - 1],
        // origin
        this.origins[points.length - 1],
        // this.toCPoint(ref_pos[points.length - 1])
      );
      let last_ts = this.timestamps[points.length - 1];
      let prev_x = coords.x;
      let prev_y = coords.y;
      let start_x = coords.x;
      let start_y = coords.y;

      let i = 2;

      //this.ctx.beginPath();
      //this.ctx.moveTo(prev_x, prev_y);
      //for (; i <= points.length; i++) {
      //  coords = sunRPointToScreenCoords(
      //    points[points.length - i],
      //    this.origins[points.length - i],
      //    // this.toCPoint(ref_pos[points.length - 1])
      //  );
      //  let x = coords.x;
      //  let y = coords.y;

      //  this.ctx.lineTo(x, y);

      //  prev_x = x;
      //  prev_y = y;
      //}
      //this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(prev_x, prev_y);
      for (let i = 2; i <= Math.min(points.length, obj.curr_tail_length); i++) {
        coords = sunRPointToScreenCoords(
          points[points.length - i],
          this.origins[points.length - i],
          // this.toCPoint(ref_pos[points.length - 1])
        );
        last_ts = this.timestamps[points.length - i];

        let x = coords.x;
        let y = coords.y;

        this.ctx.lineTo(x, y);

        prev_x = x;
        prev_y = y;
      }
      this.ctx.stroke();

      if (last_ts < this.ref_modified_ts && obj.curr_tail_length > 1) {
        obj.curr_tail_length -= 1;
      } else if (obj.curr_tail_length < obj.max_tail_length) {
        obj.curr_tail_length += 1;
      }
    }



    // Draw planets
    for (let obj of this.celestialObjects) {
      const name = obj.constructor.name;

      let pos = obj.getPosition(t);
      pos.theta %= (2 * Math.PI);
      if (this.prevPositions.get(name).length >= PREVIOUS_POS_LENGTH) {
        this.prevPositions.get(name).shift();
      }
      this.prevPositions.get(name).push(pos);

      let coords = sunRPointToScreenCoords(pos, origin);
      let x = coords.x;
      let y = coords.y;

      this.ctx.fillStyle = "white";
      this.ctx.beginPath();
      this.ctx.arc(x, y, obj.radius + 5, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.fillStyle = obj.color;
      this.ctx.beginPath();
      this.ctx.arc(x, y, obj.radius, 0, 2 * Math.PI);
      this.ctx.fill();
      this.ctx.font = `${obj.radius}px Serif`;
      this.ctx.fillStyle = "black";
      const label = name[0];
      const size = this.ctx.measureText(label);
      this.ctx.fillText(label, x - size.width / 2, y + obj.radius / 4);
    }

    if (this.origins.length >= PREVIOUS_POS_LENGTH) {
      this.origins.shift();
      this.timestamps.shift();
    }
    this.origins.push(origin);
    this.timestamps.push(t);
  }
}

